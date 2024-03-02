import { TypedAction, TypedMutation, RootState } from '@/store/types'

import { UserState } from './state'

export type UserAction<T, R = any> = TypedAction<UserState, RootState, T, R>
export type UserMutation<R = any> = TypedMutation<UserState, R>
