import { CommentMutation, CommentThread } from '@/store/modules/comment/types'

export const SELECT_COMMENT_THREAD: CommentMutation<CommentThread> = (state, thread) => {
  state.commentThreads.forEach(t => { t.isSelected = (t.id === thread.id) })
}
