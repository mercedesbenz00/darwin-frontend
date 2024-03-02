import { computed, watch } from 'vue'

import { useStore } from '@/composables'

/**
 * In charge of loading the active workflow the selected dataset item.
 *
 * This is used across the workview.
 */
export const useWorkflowLoader = () => {
  const { state, dispatch } = useStore()

  const dataset = computed(() => state.workview.dataset)

  const loadWorkflow = (): void => {
    if (dataset.value?.version !== 2) { return }
    dispatch('workview/loadV2Workflows')
  }

  watch(dataset, () => loadWorkflow(), { immediate: true })
}
