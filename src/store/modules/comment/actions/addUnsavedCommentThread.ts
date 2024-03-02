import { CommentThread } from '@/engine/models'
import { CommentAction } from '@/store/modules/comment/types'

type AddUnsavedCommentThread = CommentAction<CommentThread, CommentThread>

/**
 * Create an unsaved comment thread for either the classic workview or modern workflow.
 *
 * Assigns an id of -1 and doesn't yet persist the thread to the backend.
 */
const addUnsavedCommentThread: AddUnsavedCommentThread = ({ commit, state }, thread) => {
  commit('ADD_THREAD', { ...thread, id: -1 })

  const data = state.commentThreads.find(t => t.id === -1)

  if (!data) {
    throw new Error("Couldn't match comment thread immediately after inserting. Probable bug.")
  }

  return { data }
}

export default addUnsavedCommentThread
