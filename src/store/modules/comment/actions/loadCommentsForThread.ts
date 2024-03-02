import { getComment } from '@/store/modules/comment//serializer'
import { Comment, CommentAction, CommentThread } from '@/store/modules/comment//types'
import { loadComments } from '@/utils/backend'

type LoadCommentsForThread = CommentAction<CommentThread, Comment[]>

const loadCommentsForThread: LoadCommentsForThread = async ({ commit }, thread) => {
  if (thread.id === -1) { return { data: [] } }

  const response = await loadComments({ threadId: thread.id })
  if ('data' in response) {
    const comments = response.data.map(getComment)
    commit('SET_COMMENTS_FOR_THREAD', { comments, threadId: thread.id })
  }
  return { data: thread.comments }
}

export default loadCommentsForThread
