import { post } from '@/utils/api'
import { errorMessages, parseError, isErrorResponse } from '@/utils/error'

type Params = {
  teamSlug: string,
  datasetSlug: string,
}

/**
 * Send a report creation request
 * API will start async report generation job
 * So you will not receive download URL immediately
 */
export const createDatasetItemReport = async (params: Params) => {
  const path = `teams/${params.teamSlug}/${params.datasetSlug}/item_reports`

  try {
    return await post<void>(path)
  } catch (err: unknown) {
    if (!isErrorResponse(err)) { throw err }
    return parseError(err, errorMessages.DATASET_ITEM_REPORT_CREATE)
  }
}
