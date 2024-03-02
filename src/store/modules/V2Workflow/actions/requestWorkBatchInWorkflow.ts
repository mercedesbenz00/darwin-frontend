import { WorkflowAction } from '@/store/modules/V2Workflow/types'
import { ApiResponse, DatasetItemPayload } from '@/store/types'
import { requestWorkBatchInWorkflow as request } from '@/utils/backend'

export type Payload = {
  teamSlug: string,
  workflowId: string
}

/**
 * Request a work batch for the current user.
 *
 * The expected response is a list of assigned dataset items.
 */
export const requestWorkBatchInWorkflow: WorkflowAction<Payload, DatasetItemPayload[]> = async (
  { commit },
  { teamSlug, workflowId }
) => {
  const response = <ApiResponse<DatasetItemPayload[]>> await request({ teamSlug, workflowId })

  if ('data' in response) {
    commit('SET_WORKFLOW_ASSIGNED_ITEMS', { workflowId, assignedItems: response.data.length })
  }

  return response
}
