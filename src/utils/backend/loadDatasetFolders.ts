import { DatasetFolderPayload } from '@/store/types'
import { get } from '@/utils/api'
import { errorMessages, isErrorResponse, parseError } from '@/utils/error'

import { LoadDatasetItemsParams } from './loadDatasetItems'

export type LoadDatasetFolderParams = LoadDatasetItemsParams

export const loadDatasetFolders = async (params: LoadDatasetFolderParams) => {
  const { datasetId, ...filters } = params
  const path = `datasets/${datasetId}/folders`

  try {
    const response = await get<DatasetFolderPayload[]>(path, filters)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.DATASET_LOAD)
  }
}
