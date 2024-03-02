import {
  RootState,
  TypedAction,
  TypedMutation,
  V2Workflows
} from '@/store/types'

export type WorkflowAction<T, R = any> = TypedAction<V2Workflows, RootState, T, R>
export type WorkflowMutation<R = any> = TypedMutation<V2Workflows, R>
