import { CommentAction, CommentThread } from '@/store/modules/comment/types'
import { deleteCommentThread } from '@/utils/backend'

const removeCommentThread: CommentAction<CommentThread> =
  async ({ commit }, thread) => {
    const response = thread.id === -1
      ? { data: thread }
      : await deleteCommentThread({ threadId: thread.id })

    if ('data' in response) { commit('DELETE_COMMENT_THREAD', thread) }

    return response
  }

export default removeCommentThread
