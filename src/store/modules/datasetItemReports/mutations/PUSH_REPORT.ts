import {
  DatasetItemReportsMutation,
  DatasetItemReportPayload
} from '@/store/modules/datasetItemReports/types'

/**
 * Push report item to the top of the reports array
 */
export const PUSH_REPORT: DatasetItemReportsMutation<DatasetItemReportPayload> =
  (state, payload) => {
    state.reports.unshift(payload)
  }
