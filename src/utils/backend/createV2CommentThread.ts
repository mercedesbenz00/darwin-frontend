import { ApiResponse, V2CommentThreadPayload } from '@/store/types'
import { post } from '@/utils/api'
import { ParsedError, isErrorResponse, errorMessages, parseError } from '@/utils/error'

type Params = {
  boundingBox: { x: number, y: number, w: number, h: number }
  comments: { body: string }[]
  datasetItemId: string
  sectionIndex?: number
  slotName: string
  teamSlug: string
}

/**
 * Creates a comment thread on a 2.0 dataset item
 */
export const createV2CommentThread =
  async (params: Params): Promise<ApiResponse<V2CommentThreadPayload> | ParsedError> => {
    const {
      boundingBox: { x, y, w, h },
      comments,
      datasetItemId,
      sectionIndex,
      slotName,
      teamSlug
    } = params
    const path = `v2/teams/${teamSlug}/items/${datasetItemId}/comment_threads`

    const payload = {
      bounding_box: { x, y, w, h },
      comments,
      section_index: Number.isFinite(sectionIndex) ? sectionIndex : null,
      slot_name: slotName
    }

    try {
      const response = await post(path, payload)
      return response
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return parseError(error, errorMessages.COMMENT_THREAD_CREATE)
    }
  }
