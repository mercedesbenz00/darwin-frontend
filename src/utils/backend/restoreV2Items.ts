import { V2DatasetItemFilter } from '@/store/types/V2DatasetItemFilter'
import { post } from '@/utils/api'
import { parseError, errorMessages, isErrorResponse } from '@/utils/error'

export type Params = {
  teamSlug: string
  filters: V2DatasetItemFilter
}

/**
 * Archives a set of dataset items, as defined by a filter
 */
export const restoreV2Items = async (params: Params) => {
  const { teamSlug, filters } = params
  const path = `v2/teams/${teamSlug}/items/restore`
  const requestParams = { filters: filters }
  try {
    const response = await post(path, requestParams)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.DATASET_IMAGE_RESTORE)
  }
}
