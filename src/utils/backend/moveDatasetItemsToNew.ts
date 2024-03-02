import { DatasetItemFilter } from '@/store/types'
import { put } from '@/utils/api'
import { errorMessages, isErrorResponse, parseError } from '@/utils/error'

type Params = {
  datasetId: number,
  filter: DatasetItemFilter
}

/**
 * Targets backend endpoint which moves specified dataset items to new status,
 * while keeping annotations.
 */
export const moveDatasetItemsToNew = async (params: Params) => {
  const path = `datasets/${params.datasetId}/items/move_to_new`

  const requestParams = { filter: params.filter }

  try {
    const response = await put<void>(path, requestParams)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.DATASET_ITEMS_UPDATE)
  }
}
