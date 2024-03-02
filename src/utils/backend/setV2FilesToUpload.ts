import {
  ApiResponse,
  DatasetUploadedItemsPayloadV2,
  DatasetUploadItemPayloadV2
} from '@/store/types'
import { post } from '@/utils/api'
import {
  isErrorResponse,
  errorMessages,
  ParsedError,
  parseError
} from '@/utils/error'

type Params = {
  items: DatasetUploadItemPayloadV2[]
  tags: string[]
  path: string
  teamSlug: string
  datasetSlug: string
}

/**
 * Sends a request to the backend, to register files for upload
 */
export const setV2FilesToUpload = async (
  params: Params
): Promise<ApiResponse<DatasetUploadedItemsPayloadV2> | ParsedError> => {
  const path = `v2/teams/${params.teamSlug}/items/register_upload`
  const items = params.items.map(item => ({
    slots: [{
      as_frames: item.as_frames,
      extract_views: item.extract_views,
      tags: params.tags,
      file_name: item.file_name,
      fps: item.fps,
      slot_name: '0'
    }],
    name: item.file_name,
    layout: null,
    path: params.path,
    tags: params.tags
  }))

  try {
    const response = await post<DatasetUploadedItemsPayloadV2>(path, {
      items,
      dataset_slug: params.datasetSlug
    })
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.DATASET_UPDATE)
  }
}
