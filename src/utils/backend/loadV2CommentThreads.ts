import { ApiResponse, V2CommentThreadPayload } from '@/store/types'
import { get } from '@/utils/api'
import { errorMessages, isErrorResponse, ParsedError, parseError } from '@/utils/error'

type Params = {
  datasetItemId: string
  teamSlug: string
}

/**
 * Lists comment threads associated to a 2.0 dataset item
 */
export const loadV2CommentThreads =
  async (params: Params): Promise<ApiResponse<V2CommentThreadPayload[]> | ParsedError> => {
    const { datasetItemId, teamSlug } = params
    const path = `v2/teams/${teamSlug}/items/${datasetItemId}/comment_threads`

    try {
      const response = await get<V2CommentThreadPayload[]>(path)
      return response
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return parseError(error, errorMessages.COMMENT_THREADS_LOAD)
    }
  }
