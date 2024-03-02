import { DatasetAction } from '@/store/modules/dataset/types'
import { ApiResponse } from '@/store/types'
import { DatasetPayload } from '@/store/types/DatasetPayload'
import { api, errorMessages, isErrorResponse, parseError } from '@/utils'

/**
 * Retrieve a list of datasets
 *
 * The loaded datasets contain all of the basic fileds as the response for
 * `loadDataset`, but do not contain annotation classes.
 */
export const getDatasets: DatasetAction<undefined> = async ({ commit }) => {
  let response: ApiResponse<DatasetPayload[]>

  try {
    response = await api.get<DatasetPayload[]>('datasets')
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.DATASET_LOAD)
  }

  commit('SET_DATASETS', response.data)
  return response
}
