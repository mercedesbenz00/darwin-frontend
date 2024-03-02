import { CommentMutation } from '@/store/modules/comment/types'

export const UNFOCUS_ALL_COMMENT_THREADS: CommentMutation<void> = (state) => {
  state.commentThreads.forEach(thread => { thread.isHighlighted = false })
}
