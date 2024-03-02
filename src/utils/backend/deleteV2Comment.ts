import { ApiResponse, V2CommentPayload } from '@/store/types'
import { remove } from '@/utils/api'
import { errorMessages, isErrorResponse, ParsedError, parseError } from '@/utils/error'

type Params = {
  commentId: string
  datasetItemId: string
  teamSlug: string
  threadId: string
}

/**
 * Deletes a comment associated to a 1.0 comment thread
 */
export const deleteV2Comment =
  async (params: Params): Promise<ApiResponse<V2CommentPayload> | ParsedError> => {
    const { commentId, datasetItemId, teamSlug, threadId } = params
    const itemPath = `v2/teams/${teamSlug}/items/${datasetItemId}`
    const path = `${itemPath}/comment_threads/${threadId}/comments/${commentId}`
    try {
      const response = await remove(path)
      return response
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return parseError(error, errorMessages.COMMENT_FOR_THREAD_DELETE)
    }
  }
