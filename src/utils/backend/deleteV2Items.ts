import { V2DatasetItemFilter } from '@/store/types/V2DatasetItemFilter'
import { remove } from '@/utils/api'
import { parseError, errorMessages, isErrorResponse } from '@/utils/error'

export type Params = {
  teamSlug: string
  filters: V2DatasetItemFilter
}

/**
 * Perma-deletes a set of dataset items, as defined by a filter
 */
export const deleteV2Items = async (params: Params) => {
  const { teamSlug, filters } = params
  const path = `v2/teams/${teamSlug}/items`
  const requestParams = { filters: filters }
  try {
    const response = await remove(path, requestParams)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.DATASET_IMAGE_DELETE)
  }
}
