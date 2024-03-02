import { ApiResponse, V2CommentThreadPayload } from '@/store/types'
import { remove } from '@/utils/api'
import { errorMessages, isErrorResponse, ParsedError, parseError } from '@/utils/error'

type Params = {
  datasetItemId: string
  teamSlug: string
  threadId: string
}

/**
 * Deletes a comment thread associated to a 2.0 dataset item
 *
 * On the backend, this will also automatically delete v2 comments, so they
 * should be purged from any client store.
 */
export const deleteV2CommentThread =
  async (params: Params): Promise<ApiResponse<V2CommentThreadPayload> | ParsedError> => {
    const { datasetItemId, teamSlug, threadId } = params
    const path = `v2/teams/${teamSlug}/items/${datasetItemId}/comment_threads/${threadId}`
    try {
      const response = await remove<V2CommentThreadPayload>(path)
      return response
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return parseError(error, errorMessages.COMMENT_THREAD_DELETE)
    }
  }
