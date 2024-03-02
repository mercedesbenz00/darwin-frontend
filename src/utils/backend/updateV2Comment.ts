import { ApiResponse, V2CommentPayload } from '@/store/types'
import { put } from '@/utils/api'
import { errorMessages, isErrorResponse, parseError, ParsedError } from '@/utils/error'

type Params = {
  body: string
  commentId: string
  datasetItemId: string
  teamSlug: string
  threadId: string
}
/**
 * Updates a comment associated to a 2.0 comment thread.
 *
 * Only the body can be updated.
 */
export const updateV2Comment =
  async (params: Params): Promise<ApiResponse<V2CommentPayload> | ParsedError> => {
    const { body, teamSlug, commentId, datasetItemId, threadId } = params
    const basePath = `v2/teams/${teamSlug}/items/${datasetItemId}/comment_threads/${threadId}`
    const path = `${basePath}/comments/${commentId}`

    try {
      const response = await put<V2CommentPayload>(path, { body })
      return response
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return parseError(error, errorMessages.COMMENT_THREAD_UPDATE)
    }
  }
