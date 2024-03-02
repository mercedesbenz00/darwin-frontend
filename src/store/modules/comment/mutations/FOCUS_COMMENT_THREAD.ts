import { CommentMutation, CommentThread } from '@/store/modules/comment/types'

export const FOCUS_COMMENT_THREAD: CommentMutation<CommentThread> = (state, thread) => {
  state.commentThreads.forEach(t => { t.isHighlighted = t.id === thread.id })
}
