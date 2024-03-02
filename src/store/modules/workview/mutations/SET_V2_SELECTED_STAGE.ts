import { WorkflowMutation } from '@/store/modules/workview/types'
import { V2WorkflowStagePayload } from '@/store/types'

export const SET_V2_SELECTED_STAGE: WorkflowMutation<V2WorkflowStagePayload> =
  (state, stage) => {
    state.v2SelectedStage = stage
  }
