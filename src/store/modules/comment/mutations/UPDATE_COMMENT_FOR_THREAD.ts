import { CommentMutation, Comment } from '@/store/modules/comment/types'

export const UPDATE_COMMENT_FOR_THREAD: CommentMutation<Comment> = (state, payload) => {
  const thread = state.commentThreads
    .find(item => item.id === payload.commentThreadId)
  if (!thread) { return }
  const idx = thread.comments.findIndex(item => item.id === payload.id)
  if (idx >= 0) { thread.comments.splice(idx, 1, payload) }
}
