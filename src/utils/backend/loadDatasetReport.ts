import { DatasetItemFilter, DatasetReportPayload } from '@/store/types'
import { get } from '@/utils/api'
import { errorMessages, isErrorResponse, parseError } from '@/utils/error'

type Params = DatasetItemFilter & { datasetId: number }

export const loadDatasetReport = async (params: Params) => {
  const { datasetId, ...rest } = params
  const path = `datasets/${datasetId}/report`

  try {
    const response = await get<DatasetReportPayload>(path, rest)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.DATASET_LOAD)
  }
}
