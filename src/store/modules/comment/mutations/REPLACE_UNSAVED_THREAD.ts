import { CommentMutation, CommentThread } from '@/store/modules/comment/types'

/**
 * Replaces unsaved comment thread with the specified thread
 */
export const REPLACE_UNSAVED_THREAD: CommentMutation<CommentThread> = (state, thread) => {
  const idx = state.commentThreads.findIndex(t => t.id === -1)
  if (idx >= 0) {
    state.commentThreads.splice(idx, 1, thread)
  } else {
    state.commentThreads.push(thread)
  }
}
