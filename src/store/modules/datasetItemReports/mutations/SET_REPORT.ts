import Vue from 'vue'

import {
  DatasetItemReportsMutation,
  DatasetItemReportPayload
} from '@/store/modules/datasetItemReports/types'

/**
 * Replace existing report item
 * or push new one if not exists
 */
export const SET_REPORT: DatasetItemReportsMutation<DatasetItemReportPayload> =
  (state, payload) => {
    const index = state.reports.findIndex((r: DatasetItemReportPayload) => r.id === payload.id)

    if (state.reports[index]) {
      Vue.set(state.reports, index, payload)
    } else {
      state.reports.push(payload)
    }
  }
