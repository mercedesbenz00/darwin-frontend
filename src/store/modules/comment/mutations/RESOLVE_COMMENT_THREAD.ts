import { CommentMutation } from '@/store/modules/comment/types'

export const RESOLVE_COMMENT_THREAD: CommentMutation<number> = (state, threadId) => {
  const matched = state.commentThreads.find(item => item.id === threadId)
  if (matched) { matched.resolved = true }
}
