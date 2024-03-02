import { ApiResponse, V2CommentPayload } from '@/store/types'
import { post } from '@/utils/api'
import { errorMessages, isErrorResponse, parseError, ParsedError } from '@/utils/error'

type Params = {
  body: string
  datasetItemId: string
  teamSlug: string
  threadId: string
}

/**
 * Creates a comment as a reply to a 2.0 comment thread.
 */
export const createV2Comment = async (
  params: Params
): Promise<ApiResponse<V2CommentPayload> | ParsedError> => {
  const { body, threadId, teamSlug, datasetItemId } = params
  const path =
    `v2/teams/${teamSlug}/items/${datasetItemId}/comment_threads/${threadId}/comments`
  try {
    const response = await post<V2CommentPayload>(path, { body })
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.COMMENT_FOR_THREAD_CREATE)
  }
}
