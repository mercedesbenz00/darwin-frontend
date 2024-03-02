import { WorkflowAction } from '@/store/modules/V2Workflow/types'
import { V2WorkflowPayload } from '@/store/types'
import { loadV2Workflow } from '@/utils/backend'

export type Payload = {
  teamSlug: string
  workflowId: string
}

/**
 * Load specific workflow accessible by the current user.
 *
 * The expected response is a workflow.
 */
export const loadWorkflow: WorkflowAction<Payload, V2WorkflowPayload> = async (
  { commit },
  { teamSlug, workflowId }
) => {
  const response = await loadV2Workflow({ teamSlug, workflowId })

  if ('data' in response) {
    commit('SET_WORKFLOW', response.data)
  }

  return response
}
