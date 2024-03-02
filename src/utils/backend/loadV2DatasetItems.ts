import {
  V2DatasetItemFilter,
  V2DatasetItemPayload,
  PagedApiV2Response
} from '@/store/types'
import { getV2 } from '@/utils/api'
import { errorMessages, isErrorResponse, parseError } from '@/utils/error'

export type LoadDatasetItemsParams = V2DatasetItemFilter & { teamSlug: string }
/**
 * Retrieves list of dataset items from the backend
 *
 * Supports pagination, filtering and ordering.
 */
export const loadV2DatasetItems = async (params: LoadDatasetItemsParams) => {
  const { teamSlug, ...filters } = params
  const path = `v2/teams/${teamSlug}/items`

  try {
    const response = await getV2<PagedApiV2Response<V2DatasetItemPayload>>(path, filters)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.WORKVIEW_IMAGES_LOAD)
  }
}
