import { getComment } from '@/store/modules/comment/serializer'
import { CommentAction, Comment } from '@/store/modules/comment/types'
import { updateComment as request } from '@/utils/backend'

type UpdateComment = CommentAction<Comment, Comment>
const updateComment: UpdateComment = async ({ commit }, comment) => {
  const { body, id } = comment
  const response = await request({ body, id })
  if ('data' in response) {
    const comment = getComment(response.data)
    commit('UPDATE_COMMENT_FOR_THREAD', comment)
    return { data: comment }
  }
}

export default updateComment
