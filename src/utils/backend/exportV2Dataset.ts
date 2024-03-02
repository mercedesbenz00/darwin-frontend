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
  dataset_slug: string
  // TODO: This type is incorrect, seems to be copied from V1
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
  team_slug: string
  /* eslint-enable camelcase */
}

type Response = Promise<ApiResponse<DatasetExportPayload> | ParsedError>

/**
 * Export Dataset
 */
export const exportV2Dataset = async (params: BackendParams): Response => {
  const {
    annotation_filter: annotationFilter,
    dataset_slug: datasetSlug,
    filter,
    team_slug: teamSlug,
    ...others
  } = params

  const path = `v2/teams/${teamSlug}/datasets/${datasetSlug}/exports`
  try {
    const response = await post(path, {
      ...others,
      annotation_filters: annotationFilter,
      filters: filter
    })
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.DATASET_EXPORT)
  }
}
