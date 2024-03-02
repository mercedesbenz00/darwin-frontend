import { ApiResponse, CommentPayload } from '@/store/types'
import { post } from '@/utils/api'
import { errorMessages, isErrorResponse, parseError, ParsedError } from '@/utils/error'

type Params = {
  threadId: number
  body: string
}

/**
 * Creates a comment (modern workflow) within the specified thread, with the specified body.
 *
 * The comment will be associated to the user associated with the current sign in token.
 */
export const createComment = async (
  params: Params
): Promise<ApiResponse<CommentPayload> | ParsedError> => {
  const { body, threadId } = params
  const path = `workflow_comment_threads/${threadId}/workflow_comments`
  try {
    const response = await post<CommentPayload>(path, { body })
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.COMMENT_FOR_THREAD_CREATE)
  }
}
