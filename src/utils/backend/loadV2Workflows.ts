import { ApiResponse, V2WorkflowPayload } from '@/store/types'
import { get } from '@/utils/api'
import { errorMessages, isErrorResponse, ParsedError, parseError } from '@/utils/error'

type Params = {
  teamSlug: string
  worker?: boolean
}

type Response = Promise<ApiResponse<V2WorkflowPayload[]> | ParsedError>

/**
 * Retrieves the default workflow for the specified dataset
 */
export const loadV2Workflows = async (params: Params): Response => {
  const { teamSlug, ...rest } = params
  const path = `v2/teams/${teamSlug}/workflows`

  try {
    const response = await get<V2WorkflowPayload[]>(path, rest)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.WORKFLOWS_LOAD)
  }
}
