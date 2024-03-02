import { WorkflowMutation } from '@/store/modules/V2Workflow/types'
import { V2WorkflowPayload } from '@/store/types/V2WorkflowPayload'

export const SET_EDITED_WORKFLOW: WorkflowMutation<V2WorkflowPayload> = (state, payload) => {
  state.editedWorkflow = payload
}
