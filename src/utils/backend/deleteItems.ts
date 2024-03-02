import { DatasetItemPayload } from '@/store/types'
import { DatasetItemFilter } from '@/store/types/DatasetItemFilter'
import { remove } from '@/utils/api'
import { parseError, errorMessages, isErrorResponse } from '@/utils/error'

export type Params = {
  datasetId: number
  filter: DatasetItemFilter
}

/**
 * Perma-deletes a set of dataset items, as defined by a filter
 */
export const deleteItems = async (params: Params) => {
  const path = `datasets/${params.datasetId}/items`
  const requestParams = { filter: params.filter }
  try {
    const response = await remove<DatasetItemPayload[]>(path, requestParams)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.DATASET_IMAGE_DELETE)
  }
}
