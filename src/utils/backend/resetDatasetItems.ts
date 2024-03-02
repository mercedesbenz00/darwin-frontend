import { put } from '@/utils/api'
import { errorMessages, isErrorResponse, parseError } from '@/utils/error'

type Params = {
  datasetId: number,
  datasetItemIds: number[],
  workflowStageTemplateId: number
}

/**
 * Targets backend endpoint which sets resets specified dataset items to new.
 *
 * Any set of items within the same dataset is supported.
 * The standard filter format to specify those items is supported.
 */
export const resetDatasetItems = async (params: Params) => {
  const path = `datasets/${params.datasetId}/items/reset`

  const requestParams = {
    filter: { dataset_item_ids: params.datasetItemIds },
    workflow_stage_template_id: params.workflowStageTemplateId
  }

  try {
    const response = await put<[]>(path, requestParams)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.DATASET_ITEMS_UPDATE)
  }
}
