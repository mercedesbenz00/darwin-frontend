import { DatasetAction } from '@/store/modules/dataset/types'
import { api, errorMessages, isErrorResponse, parseError } from '@/utils'

type Payload = {
  datasetItemId?: number
  teamSlug?: string
  datasetSlug?: string
  uploadId?: string
}
/**
 * Notifies backend that a dataset file has been successfully uploaded.
 *
 * A different endpoint is hit baseed on the category of file (video or image)
 *
 * @param {string} params.datasetItemId The datasetItemId
 */
export const confirmFileUpload: DatasetAction<Payload, void> = async (
  _,
  { datasetItemId }
) => {
  let response
  try {
    response = await api.put(`dataset_items/${datasetItemId}/confirm_upload`)
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.DATASET_VIDEO_UPLOAD_CONFIRMATION)
  }

  const { data } = response
  return { data }
}

export const confirmFileUploadV2: DatasetAction<Payload, void> = async (
  _,
  { teamSlug, uploadId }
) => {
  let response
  try {
    response = await api.post(
      `v2/teams/${teamSlug}/items/uploads/${uploadId}/confirm`
    )
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.DATASET_VIDEO_UPLOAD_CONFIRMATION)
  }

  const { data } = response
  return { data }
}
