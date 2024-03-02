import { ApiResponse, CommentPayload } from '@/store/types'
import { put } from '@/utils/api'
import { errorMessages, isErrorResponse, parseError, ParsedError } from '@/utils/error'

type Params = {
  id: number
  body: string
}
/**
 * Updates a comment (modern workflow).
 *
 * Only the body can be updated.
 */
export const updateComment =
  async (params: Params): Promise<ApiResponse<CommentPayload> | ParsedError> => {
    const { body, id } = params
    const path = `workflow_comments/${id}`
    try {
      const response = await put<CommentPayload>(path, { body })
      return response
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return parseError(error, errorMessages.COMMENT_THREAD_UPDATE)
    }
  }
