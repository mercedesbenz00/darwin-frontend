import {
  DatasetItemReportsMutation,
  DatasetItemReportPayload
} from '@/store/modules/datasetItemReports/types'

/**
 * Set reports array to the store
 */
export const SET_REPORTS: DatasetItemReportsMutation<DatasetItemReportPayload[]> =
  (state, payload) => {
    state.reports = payload
  }
