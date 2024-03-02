import { V2DatasetItemFilter } from '@/store/types'
import { post } from '@/utils/api'
import { errorMessages, isErrorResponse, parseError } from '@/utils/error'

/**
 * Defines backend endpoint for addPriorityToItems
 */
type Params = {
  teamSlug: string
  filters: V2DatasetItemFilter
  priority: number
}
export const addPriorityToV2Items = async (params: Params) => {
  const { teamSlug, priority, filters } = params
  const endpoint = `v2/teams/${teamSlug}/items/priority`
  const requestParams = {
    filters: filters,
    priority: priority
  }

  try {
    const response = await post(endpoint, requestParams)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.DATASET_ITEMS_ADD_PRIORITY)
  }
}
