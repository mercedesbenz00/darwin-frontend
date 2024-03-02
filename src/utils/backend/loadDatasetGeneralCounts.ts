import { DatasetGeneralCountsPayload } from '@/store/types'
import { get } from '@/utils/api'
import { errorMessages, isErrorResponse, parseError } from '@/utils/error'

import { LoadDatasetItemsParams } from './loadDatasetItems'

export type LoadDatasetGeneralCountsParams = Omit<LoadDatasetItemsParams, 'page' | 'datasetId'> & {
  teamSlug: string
  datasetSlug: string
}

export const loadDatasetGeneralCounts = async (params: LoadDatasetGeneralCountsParams) => {
  const { teamSlug, datasetSlug, ...filters } = params
  const path = `teams/${teamSlug}/datasets/${datasetSlug}/general_counts`

  try {
    const { data } = await get<DatasetGeneralCountsPayload>(path, filters)
    return { data }
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.WORKVIEW_IMAGES_LOAD)
  }
}
