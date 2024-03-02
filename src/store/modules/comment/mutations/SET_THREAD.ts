import { CommentMutation, CommentThread } from '@/store/modules/comment/types'

export const SET_THREAD: CommentMutation<CommentThread> = (state, thread) => {
  const idx = state.commentThreads.findIndex(item => item.id === thread.id)
  if (idx >= 0) { state.commentThreads.splice(idx, 1, thread) }
}
