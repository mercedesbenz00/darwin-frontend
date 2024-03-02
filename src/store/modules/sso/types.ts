import { TypedAction, TypedMutation, RootState } from '@/store/types'

import { SSOState } from './state'

export type SSOAction<T, R = any> = TypedAction<SSOState, RootState, T, R>
export type SSOMutation<R = any> = TypedMutation<SSOState, R>

export type SSOPayload = {
  /* eslint-disable camelcase */
  idp_metadata: string
  /* eslint-enable camelcase */
}
