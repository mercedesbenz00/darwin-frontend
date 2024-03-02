import { WorkflowMutation } from '@/store/modules/V2Workflow/types'

export const SET_EDITED_WORKFLOW_NAME: WorkflowMutation<string> = (state, payload) => {
  if (!state.editedWorkflow) { return }
  state.editedWorkflow.name = payload
}
