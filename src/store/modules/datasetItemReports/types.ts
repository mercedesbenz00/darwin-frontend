import { TypedAction, TypedMutation, RootState } from '@/store/types'

import { DatasetItemReportsState } from './state'

export type DatasetItemReportsAction<T, R = any> =
  TypedAction<DatasetItemReportsState, RootState, T, R>

export type DatasetItemReportsMutation<R = any> = TypedMutation<DatasetItemReportsState, R>

export type DatasetItemReportPayload = {
  /* eslint-disable camelcase */
  id: string
  dataset_id: number
  requested_at: string
  state: 'pending' | 'started' | 'finished' | 'errored'
  team_id: number
  updated_at: string
  url?: string
  /* eslint-enable camelcase */
}
