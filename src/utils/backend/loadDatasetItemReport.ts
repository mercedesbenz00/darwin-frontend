import { DatasetItemReportPayload } from '@/store/modules/datasetItemReports/types'
import { get } from '@/utils/api'
import { errorMessages, parseError, isErrorResponse } from '@/utils/error'

type Params = {
  teamSlug: string,
  datasetSlug: string,
  reportId: string
}

/**
 * Fetch report item from the API by it's id
 */
export const loadDatasetItemReport = async (params: Params) => {
  const path = `teams/${params.teamSlug}/${params.datasetSlug}/item_reports/${params.reportId}`

  try {
    return await get<DatasetItemReportPayload>(path)
  } catch (err: unknown) {
    if (!isErrorResponse(err)) { throw err }
    return parseError(err, errorMessages.DATASET_ITEM_REPORT_LOAD)
  }
}
