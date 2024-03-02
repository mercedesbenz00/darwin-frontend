import { V2DatasetItemFilter } from '@/store/types/V2DatasetItemFilter'
import { post } from '@/utils/api'
import { parseError, errorMessages, isErrorResponse } from '@/utils/error'

export type Params = {
  teamSlug: string
  filters: V2DatasetItemFilter
  path: string
}

export const moveV2ItemsToPath = async (params: Params) => {
  const { teamSlug, filters } = params
  const path = `v2/teams/${teamSlug}/items/path`
  const requestParams = { filters: filters, path: params.path }
  try {
    const response = await post(path, requestParams)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.DATASET_MOVE_ITEMS_TO_PATH)
  }
}
