import { ApiResponse, V2DatasetItemFilter } from '@/store/types'
import { post } from '@/utils/api'
import { errorMessages, isErrorResponse, ParsedError, parseError } from '@/utils/error'

type Params = {
  assigneeId: number
  workflowId: string
  teamSlug: string
  filters: V2DatasetItemFilter
}

/**
 * Sends a request to backend, to assign a batch of dataset items already in a
 * v2 workflow, to a user.
 *
 * This will only assign items currently in review or annotate stage and will
 * only assign the current stage of the respective workflow.
 */
export const assignV2Items = async (params: Params): Promise<ApiResponse<{}> | ParsedError> => {
  const path = `v2/teams/${params.teamSlug}/items/assign`
  const payload = {
    assignee_id: params.assigneeId,
    filters: params.filters,
    workflow_id: params.workflowId
  }

  try {
    // technically, the backend does not return {}
    // but what it does currently return is likely temporary, so we should not rely on it yet,
    const response = await post<{}>(path, payload)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.DATASET_ITEMS_UPDATE)
  }
}
