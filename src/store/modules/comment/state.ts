import { CommentThread } from '@/engine/models'

export type CommentState = {
  commentThreads: CommentThread[]
}

export const getInitialState = (): CommentState => ({
  commentThreads: []
})
