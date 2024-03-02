import { CommentMutation, CommentThread } from '@/store/modules/comment/types'

export const DELETE_COMMENT_THREAD: CommentMutation<CommentThread> = (state, thread) => {
  const wfIdx = state.commentThreads.findIndex(item => item.id === thread.id)
  if (wfIdx >= 0) { state.commentThreads.splice(wfIdx, 1) }
}
