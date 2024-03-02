import { WorkflowMutation } from '@/store/modules/workview/types'
import { V2WorkflowItemPayload } from '@/store/types'

export const PUSH_V2_WORKFLOW_ITEM: WorkflowMutation<V2WorkflowItemPayload> =
  (state, item) => {
    if (!state.selectedDatasetItem) { return }
    if (state.selectedDatasetItem.id !== item.dataset_item_id) { return }
    state.selectedDatasetItem = { ...state.selectedDatasetItem, workflow_item: item }
  }
