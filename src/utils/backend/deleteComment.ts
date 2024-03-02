import { ApiResponse, CommentPayload } from '@/store/types'
import { remove } from '@/utils/api'
import { errorMessages, isErrorResponse, ParsedError, parseError } from '@/utils/error'

/**
 * Deletes a comment associated to a 1.0 comment thread
 */
export const deleteComment =
  async (params: { id: number}): Promise<ApiResponse<CommentPayload> | ParsedError> => {
    try {
      const response = await remove(`workflow_comments/${params.id}`)
      return response
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return parseError(error, errorMessages.COMMENT_FOR_THREAD_DELETE)
    }
  }
