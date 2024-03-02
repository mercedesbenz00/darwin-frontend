import { ApiResponse, V2CommentPayload } from '@/store/types'
import { get } from '@/utils/api'
import { errorMessages, isErrorResponse, ParsedError, parseError } from '@/utils/error'

type Params = {
  datasetItemId: string
  teamSlug: string
  threadId: string
}

/**
 * Loads all comments for a 2.0 comment thread
 */
export const loadV2Comments =
  async (params: Params): Promise<ApiResponse<V2CommentPayload[]> | ParsedError> => {
    const { datasetItemId, teamSlug, threadId } = params
    const path =
      `v2/teams/${teamSlug}/items/${datasetItemId}/comment_threads/${threadId}/comments`
    try {
      const response = await get<V2CommentPayload[]>(path)
      return response
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return parseError(error, errorMessages.COMMENTS_FOR_THREAD_LOAD)
    }
  }
