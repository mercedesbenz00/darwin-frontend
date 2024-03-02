import { ApiResponse, CommentThreadPayload } from '@/store/types'
import { post } from '@/utils/api'
import { ParsedError, isErrorResponse, errorMessages, parseError } from '@/utils/error'

type Params = {
  boundingBox: { x: number, y: number, w: number, h: number }
  frameIndex?: number
  comments: { body: string }[]
  workflowId: number
}

/**
 * Creates a comment thread (modern workflow)
 *
 * Uses specified bounding box and child comments to create thread and
 * one or potentially more initial comments in one request.
 */
export const createCommentThread =
  async (params: Params): Promise<ApiResponse<CommentThreadPayload> | ParsedError> => {
    const { boundingBox: { x, y, w, h }, comments, frameIndex, workflowId } = params
    const path = `workflows/${workflowId}/workflow_comment_threads`

    const payload = {
      bounding_box: { x, y, w, h },
      frame_index: frameIndex,
      workflow_comments: comments.map(c => ({ body: c.body }))
    }

    try {
      const response = await post(path, payload)
      return response
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return parseError(error, errorMessages.COMMENT_THREAD_CREATE)
    }
  }
