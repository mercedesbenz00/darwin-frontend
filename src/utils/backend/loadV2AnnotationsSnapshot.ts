import { AxiosResponse } from 'axios'

import { StageAnnotationPayload, V2DatasetItemPayload } from '@/store/types'
import { get } from '@/utils/api'
import { parseError, errorMessages, isErrorResponse, ParsedError } from '@/utils/error'

/**
 * Defines params structure for backend action
 */
type Params = {
  teamSlug: string,
  datasetItemId: V2DatasetItemPayload['id'],
  snapshotId: string
}

/**
 * Loads annotations for the specified snapshot id
 */
export const loadV2AnnotationsSnapshot =
  async (params: Params): Promise<ParsedError | AxiosResponse<StageAnnotationPayload[]>> => {
    const { teamSlug, datasetItemId, snapshotId } = params
    const path =
      `/v2/teams/${teamSlug}/items/${datasetItemId}/snapshots/${snapshotId}/annotations`

    try {
      const response = await get<StageAnnotationPayload[]>(path)
      return response
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return parseError(error, errorMessages.STAGE_LOAD)
    }
  }
