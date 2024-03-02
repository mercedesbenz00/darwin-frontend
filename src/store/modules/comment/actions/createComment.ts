import { getComment } from '@/store/modules/comment/serializer'
import { CommentAction } from '@/store/modules/comment/types'
import { createComment as request } from '@/utils/backend'

type CreateComment = CommentAction<{ body: string, threadId: number }>

const createComment: CreateComment = async ({ commit, dispatch, state }, payload) => {
  const { body, threadId } = payload

  const matchedThread = state.commentThreads.find(t => t.id === threadId)

  if (!matchedThread) { throw new Error('comment/createComment: Uknown thread id') }

  if (matchedThread.id === -1) {
    return dispatch('createCommentThread', { ...matchedThread, comments: [{ body }] })
  }

  const response = await request({ body, threadId })

  if ('data' in response) {
    commit('ADD_COMMENT_FOR_THREAD', getComment(response.data))
  }
  return { data: matchedThread.comments }
}

export default createComment
