import throttle from 'lodash/throttle'
import { computed, Ref, watch } from 'vue'

import { useDatasetChannel } from '@/composables/useDatasetChannel'
import { useItemCountsStore } from '@/composables/useItemCountsStore'
import {
  DatasetItemStatus,
  StageType,
  V2DatasetStagePayload,
  V2WorkflowPayload
} from '@/store/types'

/**
 * Implements a behavior where stage counts are automatically loaded for all
 * datasets connected to a specific workflow.
 *
 * @param teamSlug A ref to the slug of the current team.
 * @param workflow A ref to the workflow we're loading stage counts for.
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useStageCountsLoader = (
  teamSlug: Ref<string | null>,
  workflow: Ref<V2WorkflowPayload | null>
) => {
  const datasetStages = computed(() => {
    if (!workflow.value) { return [] }

    return workflow.value.stages.filter(
      (s): s is V2DatasetStagePayload => s.type === StageType.Dataset
    )
  })

  /**
   * IDs of all the datasets connected to the workflow. These become part of the
   * filter to fetch stage counts.
   */
  const datasetIds = computed<number[]>(() =>
    datasetStages.value
      .map(s => s.config.dataset_id)
      .filter((id): id is number => !!id)
  )

  /**
   * Dataset ids serialized into a string, so we can watch it for actuall changes
   * in IDs. Watching the datasetIds computed directly would trigger every time
   * it recomputes, even if the ids actually remain the same.
   *
   * We could also use a deep watcher on dataset ids, but that would be slower.
   */
  const datasetIdsCSV = computed(() => datasetIds.value.join(','))

  const countsStore = useItemCountsStore()

  const fetchStageCounts = (): void => {
    countsStore.setTeamSlug(teamSlug.value)

    if (datasetIds.value.length === 0) { return }
    countsStore.loadStageCounts({
      dataset_ids: datasetIds.value,
      not_statuses: [DatasetItemStatus.archived]
    })
  }

  const throttledFetchStageCounts = throttle(fetchStageCounts, 500, {
    leading: false,
    trailing: true
  })

  watch(datasetIdsCSV, () => throttledFetchStageCounts(), { immediate: true })

  /**
   * Connect to the dataset v2 channel for every dataset id and automatically
   * refetch stage counts when an update message is received.
   */
  useDatasetChannel(datasetIds, {
    onItemsUpdated: () => throttledFetchStageCounts(),
    onItemsDeleted: () => throttledFetchStageCounts()
  })
}
