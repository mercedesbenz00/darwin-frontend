import { CommentThread } from '@/engine/models'
import { CommentAction } from '@/store/modules/comment/types'
import { updateCommentThread as request } from '@/utils/backend'

type UpdateCommentThread = CommentAction<CommentThread, CommentThread>

const updateCommentThread: UpdateCommentThread = async ({ commit, rootState }, thread) => {
  const isUnsaved = thread.id === -1

  if (isUnsaved) {
    commit('SET_THREAD', thread)
    return { data: thread }
  }

  const { profile } = rootState.user
  if (!profile) { throw Error('Attempted to modify a comment thread while signed out') }

  const params = {
    boundingBox: thread.boundingBox,
    resolved: thread.resolved,
    threadId: thread.id
  }

  const response = await request(params)

  if ('data' in response) {
    commit('SET_THREAD', thread)
    return { data: thread }
  }
  return response
}

export default updateCommentThread
