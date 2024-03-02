import { ApiResponse, CommentThreadPayload } from '@/store/types'
import { remove } from '@/utils/api'
import { errorMessages, isErrorResponse, ParsedError, parseError } from '@/utils/error'

type Params = { threadId: number }

/**
 * Deletes a comment thread (modern workflow) from the backend.
 *
 * All thread comments should also get deleted,
 * so there should be no need to delete them separately.
 *
 * If this appears not to happen, it's a backend bug which should be reported.
 */
export const deleteCommentThread =
  async (params: Params): Promise<ApiResponse<CommentThreadPayload> | ParsedError> => {
    try {
      const path = `workflow_comment_threads/${params.threadId}`
      const response = await remove<CommentThreadPayload>(path)
      return response
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return parseError(error, errorMessages.COMMENT_THREAD_DELETE)
    }
  }
