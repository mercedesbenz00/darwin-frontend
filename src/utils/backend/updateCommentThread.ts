import { ApiResponse, CommentThreadPayload } from '@/store/types'
import { put } from '@/utils/api'
import { errorMessages, isErrorResponse, parseError, ParsedError } from '@/utils/error'

type Params = {
  boundingBox?: { h: number, w: number, x: number, y: number }
  resolved?: boolean
  threadId: number
}

/**
 * Updates a comment thread associated to a 1.0 workflow
 *
 * Only bounding box and resolved status can be updated.
 */
export const updateCommentThread =
  async (params: Params): Promise<ApiResponse<CommentThreadPayload> | ParsedError> => {
    const { threadId, resolved, boundingBox } = params

    const path = `workflow_comment_threads/${threadId}`

    const payload = { bounding_box: boundingBox, resolved }

    try {
      const response = await put<CommentThreadPayload>(path, payload)
      return response
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return parseError(error, errorMessages.COMMENT_THREAD_UPDATE)
    }
  }
