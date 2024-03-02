import { remove } from '@/utils/api'
import { errorMessages, parseError, isErrorResponse } from '@/utils/error'

type Params = {
  teamSlug: string,
  datasetSlug: string,
  reportId: string
}

/**
 * Delete report item by it's id
 */
export const deleteDatasetItemReport = async (params: Params) => {
  const path = `teams/${params.teamSlug}/${params.datasetSlug}/item_reports/${params.reportId}`

  try {
    return await remove<void>(path)
  } catch (err: unknown) {
    if (!isErrorResponse(err)) { throw err }
    return parseError(err, errorMessages.DATASET_ITEM_REPORT_DELETE)
  }
}
