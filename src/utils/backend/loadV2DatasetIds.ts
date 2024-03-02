import { V2DatasetItemFilter } from '@/store/types'
import { getV2 } from '@/utils/api'
import { errorMessages, isErrorResponse, parseError } from '@/utils/error'

/* eslint-disable camelcase */
type ResponseType = { item_ids: string[] }
/* eslint-enable camelcase */

export type LoadDatasetItemsParams = V2DatasetItemFilter & { teamSlug: string }

export const loadV2DatasetIds = async (params: LoadDatasetItemsParams) => {
  const { teamSlug, ...filters } = params
  const path = `v2/teams/${teamSlug}/items/ids`

  try {
    const response = await getV2<ResponseType>(path, filters)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.WORKVIEW_IMAGES_LOAD)
  }
}
