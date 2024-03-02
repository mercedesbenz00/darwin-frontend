import { DatasetPayload } from '@/store/types'
import { get } from '@/utils/api'
import { errorMessages, isErrorResponse, parseError } from '@/utils/error'

type Params = { datasetId: number }

export const loadDataset = async (params: Params) => {
  const { datasetId } = params
  const path = `datasets/${datasetId}`

  try {
    const response = await get<DatasetPayload>(path)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.DATASET_LOAD)
  }
}
