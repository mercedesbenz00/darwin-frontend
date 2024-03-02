import { CommentThread, Comment } from '@/engine/models'
import { RootState, TypedAction, TypedMutation } from '@/store/types'

import { CommentState } from './state'

export { CommentThread, Comment }

export type CommentAction<T, R = any> = TypedAction<CommentState, RootState, T, R>
export type CommentMutation<R = any> = TypedMutation<CommentState, R>
