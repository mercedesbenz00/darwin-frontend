import { V2DatasetFolderPayload } from '@/store/types'
import { getV2 } from '@/utils/api'
import { errorMessages, isErrorResponse, parseError } from '@/utils/error'

import { LoadDatasetItemsParams } from './loadV2DatasetItems'

export type LoadDatasetFolderParams = LoadDatasetItemsParams
export type LoadDatasetFolderResponse = {
  folders: V2DatasetFolderPayload[]
}

export const loadV2DatasetFolders = async (params: LoadDatasetFolderParams) => {
  const { teamSlug, ...filters } = params
  const path = `v2/teams/${teamSlug}/items/folders`

  try {
    const response = await getV2<LoadDatasetFolderResponse>(path, filters)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.DATASET_LOAD)
  }
}
