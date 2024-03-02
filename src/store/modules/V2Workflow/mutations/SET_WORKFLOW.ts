import { WorkflowMutation } from '@/store/modules/V2Workflow/types'
import { V2WorkflowPayload } from '@/store/types/V2WorkflowPayload'

export const SET_WORKFLOW: WorkflowMutation<V2WorkflowPayload> = (state, payload) => {
  const index = state.workflows.findIndex(w => w.id === payload.id)
  if (index > -1) {
    state.workflows[index] = payload
  } else {
    state.workflows.push(payload)
  }
}
