import {
  V2DatasetItemPayload
} from '@/store/types'
import { getV2 } from '@/utils/api'
import { errorMessages, isErrorResponse, parseError } from '@/utils/error'

export type LoadDatasetItemsParams = { teamSlug: string, itemId: string }
/**
 * Retrieves list of dataset items from the backend
 *
 * Supports pagination, filtering and ordering.
 */
export const loadV2DatasetItem = async (params: LoadDatasetItemsParams) => {
  const { teamSlug, itemId } = params
  const path = `v2/teams/${teamSlug}/items/${itemId}`

  try {
    const response = await getV2<V2DatasetItemPayload>(path)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.WORKVIEW_IMAGES_LOAD)
  }
}
