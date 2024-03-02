import { WorkflowMutation } from '@/store/modules/workview/types'
import { V2WorkflowStageInstancePayload } from '@/store/types'

export const SET_V2_SELECTED_STAGE_INSTANCE: WorkflowMutation<V2WorkflowStageInstancePayload> =
  (state, instance) => {
    state.v2SelectedStageInstance = instance
  }
