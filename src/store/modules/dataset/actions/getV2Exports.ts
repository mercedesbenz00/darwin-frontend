import { DatasetAction } from '@/store/modules/dataset/types'
import { ApiResponse, DatasetExportPayload } from '@/store/types'
import { api, errorMessages, isErrorResponse, parseError } from '@/utils'

type Payload = {
  teamSlug: string
  datasetSlug: string
}

export const getV2Exports: DatasetAction<Payload> = async ({ commit }, payload) => {
  const path = `v2/teams/${payload.teamSlug}/datasets/${payload.datasetSlug}/exports`

  let response: ApiResponse<DatasetExportPayload[]>
  try {
    response = await api.get<DatasetExportPayload[]>(path)
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.DATASET_EXPORT)
  }

  commit('SET_DATASET_EXPORTS', response.data)
  return response
}
