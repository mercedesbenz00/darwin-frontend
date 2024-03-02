import { TypedAction, TypedMutation, RootState } from '@/store/types'

import { AuthState } from './state'

export type TfaCredentials = {
  email: string
  password: string
}

export type AuthAction<T, R = any> = TypedAction<AuthState, RootState, T, R>
export type AuthMutation<R = any> = TypedMutation<AuthState, R>
