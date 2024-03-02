import { DatasetItemReportPayload } from './types'

export type DatasetItemReportsState = {
  reports: DatasetItemReportPayload[]
}

export const getInitialState = (): DatasetItemReportsState => ({
  reports: []
})

// initial state
export const state: DatasetItemReportsState = getInitialState()
