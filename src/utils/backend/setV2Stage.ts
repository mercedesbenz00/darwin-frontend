import { ApiResponse, V2DatasetItemFilter } from '@/store/types'
import { post } from '@/utils/api'
import { errorMessages, isErrorResponse, ParsedError, parseError } from '@/utils/error'

type Params = {
  filters: V2DatasetItemFilter
  stageId: string
  teamSlug: string
  workflowId: string
}

/**
 * Sends a request to backend, to move a collection of dataset items into the
 * specified v2 workflow stage.
 *
 * This will only assign items currently in review or annotate stage and will
 * only assign the current stage of the respective workflow.
 */
export const setV2Stage = async (params: Params): Promise<ApiResponse<{}> | ParsedError> => {
  const path = `v2/teams/${params.teamSlug}/items/stage`
  const payload = {
    filters: params.filters,
    stage_id: params.stageId,
    workflow_id: params.workflowId
  }

  try {
    // technically, the backend does not return {}
    // but what it does currently return is likely temporary, so we should not rely on it yet,
    const response = await post<{}>(path, payload)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.DATASET_ITEMS_UPDATE)
  }
}
