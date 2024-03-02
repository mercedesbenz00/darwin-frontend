import { Getter } from 'vuex'

import { DatasetItemReportsState } from '@/store/modules/datasetItemReports/state'
import { DatasetItemReportPayload } from '@/store/modules/datasetItemReports/types'
import { RootState } from '@/store/types'

/**
 * Returns ordered by date list of reports
 */
export const reports: Getter<DatasetItemReportsState, RootState> =
  (state): DatasetItemReportPayload[] => {
    return [...state.reports].sort(
      (a, b) => new Date(b.requested_at).getTime() - new Date(a.requested_at).getTime()
    )
  }
