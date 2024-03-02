import { CommentMutation, CommentThread } from '@/store/modules/comment/types'

export const SET_THREADS: CommentMutation<CommentThread[]> = (state, payload) => {
  state.commentThreads = payload
}
