import { RootState, TypedAction, TypedMutation } from '@/store/types'

import { StorageState } from './state'

export type StorageAction<T, R = any> = TypedAction<StorageState, RootState, T, R>
export type StorageMutation<R = any> = TypedMutation<StorageState, R>
