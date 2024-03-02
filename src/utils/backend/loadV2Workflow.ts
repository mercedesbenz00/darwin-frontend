import { ApiResponse, V2WorkflowPayload } from '@/store/types'
import { get } from '@/utils/api'
import { errorMessages, isErrorResponse, ParsedError, parseError } from '@/utils/error'

type Params = {
  teamSlug: string
  workflowId: string
}

type Response = Promise<ApiResponse<V2WorkflowPayload> | ParsedError>

/**
 * Loads specific workflow via id and team slug
 */
export const loadV2Workflow = async (params: Params): Response => {
  const { teamSlug, workflowId } = params
  const path = `v2/teams/${teamSlug}/workflows/${workflowId}`

  try {
    const response = await get<V2WorkflowPayload>(path)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.WORKFLOWS_LOAD)
  }
}
