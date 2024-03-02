import { put } from '@/utils/api'
import { errorMessages, isErrorResponse, parseError } from '@/utils/error'

type Params = {
  datasetId: number,
  datasetItemIds: number[],
  workflowStageTemplateId: number
}

/**
 * Targets backend endpoint which sets the stage for all specified dataset items.
 *
 * Backend endpoint only supports items with initialized workflows, all
 * generated from the same workflow template.
 *
 * In theory, it is allowed for items to be in different stages of those
 * workflows.
 */
export const setDatasetItemsStage = async (params: Params) => {
  const path = `datasets/${params.datasetId}/set_stage`

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
