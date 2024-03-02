import { watch, computed } from 'vue'

import { useStore } from '@/composables'

export const useTimeSummaryLoader = (): void => {
  const { getters, dispatch, state } = useStore()

  const stageInstanceV2 = computed(() => state.workview.v2SelectedStageInstance)
  const selectedDatasetItem = computed(() => getters['workview/v2SelectedDatasetItem'])
  const dataset = computed(() => state.workview.dataset)

  watch(stageInstanceV2, (newStage, oldStage) => {
    if (!selectedDatasetItem.value) { return }
    if (newStage && oldStage && newStage.id === oldStage.id) { return }
    dispatch('workview/loadV2TimeSummary', {
      item: selectedDatasetItem.value, teamSlug: dataset.value?.team_slug
    })
  }, { immediate: true })
}
