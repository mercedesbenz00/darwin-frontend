import { V2DatasetClassCountsPayload } from '@/store/types'
import { getV2 } from '@/utils/api'
import { errorMessages, isErrorResponse, parseError } from '@/utils/error'

import { LoadDatasetItemsParams } from './loadV2DatasetItems'

export type LoadDatasetClassCountsParams = LoadDatasetItemsParams

export const loadV2DatasetClassCounts = async (params: LoadDatasetClassCountsParams) => {
  const { teamSlug, ...filters } = params
  const path = `v2/teams/${teamSlug}/items/class_counts`

  try {
    const { data } = await getV2<V2DatasetClassCountsPayload>(path, filters)
    return { data }
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.WORKVIEW_IMAGES_LOAD)
  }
}
