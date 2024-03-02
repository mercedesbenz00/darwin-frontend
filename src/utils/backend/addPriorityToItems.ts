import { DatasetItemFilter } from '@/store/types'
import { put } from '@/utils/api'
import { errorMessages, isErrorResponse, parseError } from '@/utils/error'

/**
 * Defines backend endpoint for addPriorityToItems
 */
type Params = {
  datasetId: number
  filter: DatasetItemFilter
  priority: number
}
export const addPriorityToItems = async (params: Params) => {
  const endpoint = `datasets/${params.datasetId}/items/priority`
  const requestParams = {
    filter: params.filter,
    priority: params.priority
  }

  try {
    const response = await put(endpoint, requestParams)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.DATASET_ITEMS_ADD_PRIORITY)
  }
}
