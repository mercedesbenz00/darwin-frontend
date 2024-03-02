import { CommentMutation, Comment } from '@/store/modules/comment/types'

export const ADD_COMMENT_FOR_THREAD: CommentMutation<Comment> = (state, comment) => {
  const thread =
    state.commentThreads.find(thread => thread.id === comment.commentThreadId)
  if (!thread) { return }
  thread.comments.push(comment)
  thread.commentCount = thread.comments.length
}
