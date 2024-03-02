import { WorkflowMutation } from '@/store/modules/workview/types'
import { V2WorkflowItemStatePayload } from '@/store/types'

export const SET_V2_WORKFLOW_ITEM_STATE: WorkflowMutation<V2WorkflowItemStatePayload> =
  (state, itemState) => {
    state.v2WorkflowItemState = itemState
  }
