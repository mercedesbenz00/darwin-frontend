import { WorkflowMutation } from '@/store/modules/V2Workflow/types'
import { V2WorkflowPayload } from '@/store/types'

type Payload = V2WorkflowPayload[]

/**
 * Change the V2 workflows state by setting it with the workflows returned by
 * the API.
 *
 * The new workflows payload effectively replaces the existing state instead of
 * merging, otherwise when old information would still be visible, such as
 * previous assignments when changing in and out of worker mode.
 *
 * @param state Current V2 workflows state (mutable).
 * @param workflows Workflows payload returned by the API.
 */
export const SET_WORKFLOWS: WorkflowMutation<Payload> = (state, workflows) => {
  state.workflows = workflows
}
