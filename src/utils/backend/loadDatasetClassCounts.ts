import { DatasetClassCountsPayload } from '@/store/types'
import { get } from '@/utils/api'
import { errorMessages, isErrorResponse, parseError } from '@/utils/error'

import { LoadDatasetItemsParams } from './loadDatasetItems'

export type LoadDatasetClassCountsParams = Omit<LoadDatasetItemsParams, 'page' | 'datasetId'> & {
  teamSlug: string
  datasetSlug: string
}

export const loadDatasetClassCounts = async (params: LoadDatasetClassCountsParams) => {
  const { teamSlug, datasetSlug, ...filters } = params
  const path = `teams/${teamSlug}/datasets/${datasetSlug}/class_counts`

  try {
    const { data } = await get<DatasetClassCountsPayload[]>(path, filters)
    return { data }
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.WORKVIEW_IMAGES_LOAD)
  }
}
