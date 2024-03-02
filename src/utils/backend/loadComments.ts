import { ApiResponse, CommentPayload } from '@/store/types'
import { get } from '@/utils/api'
import { errorMessages, isErrorResponse, ParsedError, parseError } from '@/utils/error'

type Params = { threadId: number }

/**
 * Loads all comments for a 1.0 comment thread
 */
export const loadComments =
  async (params: Params): Promise<ApiResponse<CommentPayload[]> | ParsedError> => {
    const { threadId } = params
    try {
      const response = await get<CommentPayload[]>(
        `workflow_comment_threads/${threadId}/workflow_comments`
      )
      return response
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return parseError(error, errorMessages.COMMENTS_FOR_THREAD_LOAD)
    }
  }
