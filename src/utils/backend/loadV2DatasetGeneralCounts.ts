import { V2DatasetGeneralCountsPayload } from '@/store/types'
import { getV2 } from '@/utils/api'
import { errorMessages, isErrorResponse, parseError } from '@/utils/error'

import { LoadDatasetItemsParams } from './loadV2DatasetItems'

export type LoadDatasetGeneralCountsParams = Omit<LoadDatasetItemsParams, 'page' | 'sort'>

export const loadV2DatasetGeneralCounts = async (params: LoadDatasetGeneralCountsParams) => {
  const { teamSlug, ...filters } = params
  const path = `v2/teams/${teamSlug}/items/general_counts`

  try {
    const { data } = await getV2<V2DatasetGeneralCountsPayload>(path, filters)
    return { data }
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.WORKVIEW_IMAGES_LOAD)
  }
}
