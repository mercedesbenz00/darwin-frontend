import { CommentMutation, CommentThread } from '@/store/modules/comment/types'

export const ADD_THREAD: CommentMutation<CommentThread> = (state, thread) => {
  const idx = state.commentThreads.findIndex(t => t.id === thread.id)
  if (idx > -1) {
    state.commentThreads.splice(idx, 1, thread)
  } else {
    state.commentThreads.push(thread)
  }
}
