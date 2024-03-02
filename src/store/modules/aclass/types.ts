import { RootState, TypedAction, TypedMutation } from '@/store/types'

import { AClassState } from './state'

export type AClassAction<T, R = any> = TypedAction<AClassState, RootState, T, R>
export type AClassMutation<R = any> = TypedMutation<AClassState, R>
