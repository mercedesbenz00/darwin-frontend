import { ApiResponse, V2CommentThreadPayload } from '@/store/types'
import { put } from '@/utils/api'
import { errorMessages, isErrorResponse, parseError, ParsedError } from '@/utils/error'

type Params = {
  boundingBox?: { h: number, w: number, x: number, y: number }
  datasetItemId: string
  resolved?: boolean
  teamSlug: string
  threadId: string
}

/**
 * Updates a comment thread associated to a 2.0 dataset item
 *
 * Only the bounding box and resolved status can be updated.
 */
export const updateV2CommentThread =
  async (params: Params): Promise<ApiResponse<V2CommentThreadPayload> | ParsedError> => {
    const {
      datasetItemId,
      teamSlug,
      threadId
    } = params
    const path = `v2/teams/${teamSlug}/items/${datasetItemId}/comment_threads/${threadId}`
    const payload: {
      resolved?: boolean
      // eslint-disable-next-line camelcase
      bounding_box?: { x: number, y: number, h: number, w: number }
    } = {}

    if ('resolved' in params) { payload.resolved = params.resolved }
    if ('boundingBox' in params) { payload.bounding_box = params.boundingBox }

    try {
      const response = await put<V2CommentThreadPayload>(path, payload)
      return response
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return parseError(error, errorMessages.COMMENT_THREAD_UPDATE)
    }
  }
