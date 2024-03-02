import { WorkflowMutation } from '@/store/modules/workview/types'
import { V2WorkflowPayload } from '@/store/types'

export const SET_V2_WORKFLOWS: WorkflowMutation<V2WorkflowPayload[]> =
  (state, workflows) => {
    state.v2Workflows = workflows
  }
