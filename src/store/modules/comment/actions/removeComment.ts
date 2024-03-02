import { Comment, CommentAction } from '@/store/modules/comment/types'
import { CommentPayload } from '@/store/types'
import { deleteComment } from '@/utils/backend'

type RemoveComment = CommentAction<Comment, CommentPayload>

const removeComment: RemoveComment = async ({ commit }, comment) => {
  const response = await deleteComment({ id: comment.id })

  if ('data' in response) { commit('DELETE_COMMENT', comment) }

  return response
}

export default removeComment
