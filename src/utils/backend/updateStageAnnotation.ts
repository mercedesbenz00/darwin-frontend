import { AxiosResponse } from 'axios'

import { StageAnnotationPayload } from '@/store/types'
import { withCancelToken } from '@/utils/CancelTokenManager'
import { put, AdditionalRequestOptions } from '@/utils/api'
import { errorMessages, isErrorResponse, parseError, ParsedError } from '@/utils/error'

/**
 * Defines params structure for the updateStageAnnotation backend action
 */
export type UpdateStageAnnotationParams = {
  id: string
  stageId: number
  annotationClassId: number
  data?: object
  zIndex?: number
}

/**
 * Updates an existing stage annotation on the backend
 */
export const updateStageAnnotation = async (
  params: UpdateStageAnnotationParams,
  options?: AdditionalRequestOptions
): Promise<AxiosResponse<StageAnnotationPayload> | ParsedError> => {
  const path = `workflow_stages/${params.stageId}/annotations/${params.id}`
  const attrs = {
    annotation_class_id: params.annotationClassId,
    data: params.data,
    z_index: params.zIndex
  }

  try {
    const putWithCancelToken = withCancelToken<AxiosResponse<StageAnnotationPayload>>(
      options => put<StageAnnotationPayload>(path, attrs, options)
    )

    const response = await putWithCancelToken(`${params.stageId}_${params.id}`, options)

    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.DATASET_IMAGE_ANNOTATE)
  }
}
