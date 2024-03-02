import { CommentMutation } from '@/store/modules/comment/types'

export const REMOVE_UNSAVED_THREAD: CommentMutation<void> = (state) => {
  const workflowIdx = state.commentThreads.findIndex(t => t.id === -1)
  if (workflowIdx > -1) {
    state.commentThreads.splice(workflowIdx, 1)
  }
}
