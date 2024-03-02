import { CommentThread, CommentAction } from '@/store/modules/comment/types'
import { updateCommentThread } from '@/utils/backend'

type ResolveCommentThread = CommentAction<CommentThread>

const resolveCommentThread: ResolveCommentThread = async ({ commit }, thread) => {
  const response = await updateCommentThread({ threadId: thread.id, resolved: true })

  if ('data' in response) { commit('RESOLVE_COMMENT_THREAD', thread.id) }

  return response
}

export default resolveCommentThread
