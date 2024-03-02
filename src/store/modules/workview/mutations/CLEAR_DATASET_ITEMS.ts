import { WorkflowMutation } from '@/store/modules/workview/types'

export const CLEAR_DATASET_ITEMS: WorkflowMutation<void> = (state) => {
  state.datasetItems = []
  state.selectedDatasetItem = null
}
