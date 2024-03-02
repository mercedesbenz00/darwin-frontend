import { DatasetItemTimeSummaryPayload } from '@/store/types'
import { get } from '@/utils/api'
import { errorMessages, isErrorResponse, parseError } from '@/utils/error'

type Params = {
  datasetItemId: number
}

export const loadDatasetItemTimeSummary = async (params: Params) => {
  const path = `dataset_items/${params.datasetItemId}/time_summary`

  try {
    const response = await get<DatasetItemTimeSummaryPayload>(path)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.DATASET_ITEM_LOAD)
  }
}
