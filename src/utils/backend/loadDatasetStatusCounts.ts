import { DatasetStatusCountsPayload } from '@/store/types'
import { get } from '@/utils/api'
import { errorMessages, isErrorResponse, parseError } from '@/utils/error'

import { LoadDatasetItemsParams } from './loadDatasetItems'

export type LoadDatasetStatusCountsParams = Omit<LoadDatasetItemsParams, 'page' | 'datasetId'> & {
  teamSlug: string
  datasetSlug: string
}

export const loadDatasetStatusCounts = async (params: LoadDatasetStatusCountsParams) => {
  const { teamSlug, datasetSlug, ...filters } = params
  const path = `teams/${teamSlug}/datasets/${datasetSlug}/status_counts`

  try {
    const { data } = await get<DatasetStatusCountsPayload[]>(path, filters)
    return { data }
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.WORKVIEW_IMAGES_LOAD)
  }
}
