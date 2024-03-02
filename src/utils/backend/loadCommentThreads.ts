import { ApiResponse, CommentThreadPayload } from '@/store/types'
import { get } from '@/utils/api'
import { errorMessages, isErrorResponse, ParsedError, parseError } from '@/utils/error'

type Params = { workflowId: number }

/**
 * Lists comment threads associated to a 1.0 workflow
 */
export const loadCommentThreads =
  async (params: Params): Promise<ApiResponse<CommentThreadPayload[]> | ParsedError> => {
    const { workflowId } = params
    const path = `workflows/${workflowId}/workflow_comment_threads`

    try {
      const response = await get<CommentThreadPayload[]>(path)
      return response
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return parseError(error, errorMessages.COMMENT_THREADS_LOAD)
    }
  }
