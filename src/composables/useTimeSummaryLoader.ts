import { computed, watch, onMounted } from 'vue'

import { useStore } from '@/composables'
import { DatasetItemPayload } from '@/store/types'

export const useTimeSummaryLoader = (): void => {
  const { dispatch, state } = useStore()

  const item = computed((): DatasetItemPayload | null => {
    return state.workview.selectedDatasetItem
  })

  const loadSummary = (): void => {
    if (!item.value) { return }
    dispatch('workview/loadTimeSummary', item.value)
  }

  onMounted((): void => loadSummary())

  watch(() => item.value, () => loadSummary())
}
