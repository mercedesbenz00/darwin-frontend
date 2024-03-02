import { ApiResponse, V2WorkflowPayload, V2WorkflowStagePayload } from '@/store/types'
import { post } from '@/utils/api'
import { errorMessages, isErrorResponse, ParsedError, parseError } from '@/utils/error'

type Params = {
  teamSlug: string
  name: string
  stages: V2WorkflowStagePayload[]
}

type Response = Promise<ApiResponse<V2WorkflowPayload> | ParsedError>

export const createV2Workflow = async ({ teamSlug, name, stages }: Params): Response => {
  const path = `v2/teams/${teamSlug}/workflows`

  try {
    const response = await post<V2WorkflowPayload>(path, { name, stages })
    return { data: response.data }
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.WORKFLOW_CREATE)
  }
}
