import { ApiResponse, V2WorkflowPayload, V2WorkflowStagePayload } from '@/store/types'
import { put } from '@/utils/api'
import { errorMessages, isErrorResponse, ParsedError, parseError } from '@/utils/error'

type Params = {
  teamSlug: string
  name: string
  stages: V2WorkflowStagePayload[]
  workflowId: string
}

type Response = Promise<ApiResponse<V2WorkflowPayload> | ParsedError>

export const updateV2Workflow = async (params: Params): Response => {
  const { teamSlug, name, stages, workflowId } = params
  const path = `v2/teams/${teamSlug}/workflows/${workflowId}`

  try {
    const response = await put<V2WorkflowPayload>(path, { name, stages })
    return { data: response.data }
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.WORKFLOW_UPDATE)
  }
}
