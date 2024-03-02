import { DatasetAction } from '@/store/modules/dataset/types'
import {
  DatasetUploadItemPayload,
  DatasetUploadItemPayloadV2
} from '@/store/types/DatasetUploadItemPayload'
import {
  DatasetUploadedItemsPayload,
  DatasetUploadedItemsPayloadV2
} from '@/store/types/DatasetUploadedItemsPayload'
import { api, errorMessages, isErrorResponse, parseError } from '@/utils'
import { setV2FilesToUpload as request } from '@/utils/backend'

type Payload = {
  datasetSlug: string
  items: DatasetUploadItemPayload[]
}

type Response = DatasetUploadedItemsPayload

type Action = DatasetAction<Payload, Response>
/**
 * Used at the start of a dataset upload, to precreate item records on the backend
 *
 * Returns video and image data with s3 keys to upload to.
 */
export const updateDatasetData: Action = async ({ commit, rootState }, { datasetSlug, items }) => {
  const { currentTeam } = rootState.team
  if (!currentTeam) {
    throw new Error('Cannot find current team')
  }

  let response

  try {
    response = await api.put(`teams/${currentTeam.slug}/datasets/${datasetSlug}/data`, {
      items: items.map(item => ({
        ...item,
        path: rootState.datasetUpload.path,
        tags: rootState.datasetUpload.tags
      }))
    })
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.DATASET_UPDATE)
  }

  commit('SET_CURRENT_DATASET_LOADED')
  return response
}

type PayloadV2 = {
  datasetSlug: string
  items: DatasetUploadItemPayloadV2[]
}

type ResponseV2 = DatasetUploadedItemsPayloadV2

type ActionV2 = DatasetAction<PayloadV2, ResponseV2>

export const updateDatasetDataV2: ActionV2 = async (
  { commit, rootState },
  { datasetSlug, items }
) => {
  const { currentTeam } = rootState.team
  if (!currentTeam) {
    throw new Error('Cannot find current team')
  }

  const params: Parameters<typeof request>[0] = {
    items,
    tags: rootState.datasetUpload.tags,
    path: rootState.datasetUpload.path,
    teamSlug: currentTeam.slug,
    datasetSlug
  }

  const response = await request(params)

  if ('error' in response) {
    return response
  }

  commit('SET_CURRENT_DATASET_LOADED')
  return response
}
