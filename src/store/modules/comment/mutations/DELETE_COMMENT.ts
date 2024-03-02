import { CommentMutation, Comment } from '@/store/modules/comment/types'

import { DELETE_COMMENT_THREAD } from './DELETE_COMMENT_THREAD'

export const DELETE_COMMENT: CommentMutation<Comment> = (state, comment) => {
  const thread = state.commentThreads.find(item => item.id === comment.commentThreadId)
  if (!thread) { return }

  const idx = thread.comments.findIndex(item => item.id === comment.id)
  if (idx >= 0) {
    thread.comments.splice(idx, 1)
    thread.commentCount = thread.comments.length
  }
  if (thread.comments.length === 0) { DELETE_COMMENT_THREAD(state, thread) }
}
