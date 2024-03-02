import { computed } from 'vue'

import { useRoute, useRouter } from '@/composables/useRouter'
import { useStore } from '@/composables/useStore'
import { V2DatasetItemPayload } from '@/store/types'

type UseGoToNextItem = {
  goToNextItem: () => void
}

/**
 * This advance to the next item in the workview (replicating V1 behavior)
 */
export const useGoToNextItem = (): UseGoToNextItem => {
  const router = useRouter()
  const route = useRoute()
  const { state } = useStore()

  const selectedDatasetItemV2Id = computed((): V2DatasetItemPayload['id'] | null => {
    return state.workview.selectedDatasetItemV2Id
  })

  const datasetItemIdsV2 = computed((): V2DatasetItemPayload['id'][] => {
    return state.dataset.datasetItemIdsV2
  })

  const goToNextItem = (): void => {
    if (!selectedDatasetItemV2Id.value) { return }

    const currentItemIndex = datasetItemIdsV2.value
      .indexOf(
        selectedDatasetItemV2Id.value
      )
    const nextItemIndex = currentItemIndex + 1

    if (!datasetItemIdsV2.value[nextItemIndex]) { return }
    router.push({
      query: {
        ...route.query,
        item: datasetItemIdsV2.value[nextItemIndex]
      }
    })
  }

  return {
    goToNextItem
  }
}
