import { DatasetItemFilter } from '@/store/types/DatasetItemFilter'
import { put } from '@/utils/api'
import { parseError, errorMessages, isErrorResponse } from '@/utils/error'

type Params = {
  datasetId: number
  filter: DatasetItemFilter
  path: string
}

export const moveItemsToPath = async (params: Params) => {
  const path = `datasets/${params.datasetId}/move_items`
  const requestParams = {
    filter: params.filter,
    path: params.path
  }
  try {
    const response = await put(path, requestParams)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.DATASET_MOVE_ITEMS_TO_PATH)
  }
}
