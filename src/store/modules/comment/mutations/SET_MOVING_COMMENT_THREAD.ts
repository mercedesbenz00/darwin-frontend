import { CommentMutation, CommentThread } from '@/store/modules/comment/types'

export const SET_MOVING_COMMENT_THREAD: CommentMutation<CommentThread> = (state, thread) => {
  state.commentThreads.forEach(t => { t.isMoving = (t.id === thread.id) })
}
