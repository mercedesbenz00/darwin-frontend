import {
  DatasetItemReportsMutation,
  DatasetItemReportPayload
} from '@/store/modules/datasetItemReports/types'

/**
 * Delete report item from the store
 */
export const DELETE_REPORT: DatasetItemReportsMutation<string> = (state, reportId) => {
  state.reports = state.reports.filter((r: DatasetItemReportPayload) => r.id !== reportId)
}
