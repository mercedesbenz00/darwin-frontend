import {
  ApiResponse,
  DatasetExportPayload,
  DatasetItemStatus,
  DatasetItemType
} from '@/store/types'
import { post } from '@/utils/api'
import { errorMessages, isErrorResponse, ParsedError, parseError } from '@/utils/error'

type BackendParams = {
  /* eslint-disable camelcase */
  annotation_filter: {
    annotation_class_ids?: number[]
  },
  dataset_id: number
  filter: {
    not_annotation_class_ids?: number[]
    annotation_class_ids?: number[]
    assignees?: number[]
    current_assignees?: number[]
    dataset_item_ids?: number[]
    path?: string
    statuses?: DatasetItemStatus[]
    filenames?: string[],
    types?: DatasetItemType[]
    video_ids?: number[],
    workflow_stage_template_ids?: number[]
  }
  format: string
  include_authorship: boolean
  include_export_token: boolean
  name: string
  /* eslint-enable camelcase */
}

type Response = Promise<ApiResponse<DatasetExportPayload> | ParsedError>

/**
 * Export Dataset
 */
export const exportDataset = async (params: BackendParams): Response => {
  const { annotation_filter: annotationFilter, dataset_id: datasetId, filter, ...others } = params

  const path = `datasets/${datasetId}/exports`
  try {
    const response = await post(path, {
      ...others,
      annotation_filter: annotationFilter,
      filter: filter
    })
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.DATASET_EXPORT)
  }
}
