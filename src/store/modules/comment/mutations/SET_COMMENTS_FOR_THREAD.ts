import { CommentMutation, Comment } from '@/store/modules/comment/types'

type Mutation = CommentMutation<{comments: Comment[], threadId: number}>

export const SET_COMMENTS_FOR_THREAD: Mutation = (state, payload) => {
  const { comments, threadId } = payload
  if (comments.length === 0) {
    const match = state.commentThreads.find(thread => thread.id === threadId)
    if (match) { match.comments = [] }
  } else {
    const match = state.commentThreads.find(thread => thread.id === threadId)
    if (match) { match.comments = comments }
  }
}
