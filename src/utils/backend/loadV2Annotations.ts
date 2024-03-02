import { AxiosResponse } from 'axios'

import { StageAnnotationPayload, V2DatasetItemPayload } from '@/store/types'
import { get } from '@/utils/api'
import { parseError, errorMessages, isErrorResponse, ParsedError } from '@/utils/error'

/**
 * Defines params structure for the loadStageAnnotations backend action
 */
type Payload = {
  teamSlug: string
  datasetSlug: string
  datasetItemId: V2DatasetItemPayload['id']
  annotationGroupIds?: string[]
}

/**
 * Loads stage annotations for the specified stage id
 */
export const loadV2Annotations =
  async (params: Payload): Promise<ParsedError | AxiosResponse<StageAnnotationPayload[]>> => {
    const { teamSlug, datasetItemId, annotationGroupIds } = params
    const queryParam = annotationGroupIds?.map(p => `annotation_group_ids[]=${p}`).join('&')
    const path =
      `v2/teams/${teamSlug}/items/${datasetItemId}/annotations${queryParam ? `?${queryParam}` : ''}`

    try {
      const response = await get<StageAnnotationPayload[]>(path)
      return response
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return parseError(error, errorMessages.STAGE_LOAD)
    }
  }
