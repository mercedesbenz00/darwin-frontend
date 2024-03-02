import { computed } from 'vue'

import { useStore } from './useStore'

/**
 * Temporary composable used to deal with often repated code related to how the
 * dataset vuex store module works.
 * 
 * There, we have the concept of a "currentDataset", which is a custom, 
 * frontend-built payload of whatever dataset is being viewed, which builds in
 * multiple steps and consists of an id and detailed counts.
 * 
 * But we also have the concept of the exact backend payload for that current 
 * dataset.
 * 
 * Over time, as we phase out the vuex module in favor of pinia, we should drop
 * this concept and simplify.
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useDataset = () => {
  const store = useStore()
  const currentDataset = computed(() => store.state.dataset.currentDataset)
  const dataset = computed(
    () => store.state.dataset.datasets.find(d => d.id === currentDataset.value?.id) || null
  )

  return { 
    /**
     * Returns data for the currently selected dataset in the store. 
     * This is usually the dataset whose route we're on and it can be partially
     * loaded. It consists of an id and count details
     */
    currentDataset, 
    /**
     * Returns the proper backend payload for whatever dataset is returned 
     * by `currentDataset`.
     */
    dataset 
  }
}
