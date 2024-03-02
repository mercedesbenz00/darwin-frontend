import { DatasetAction } from '@/store/modules/dataset/types'
import { allItemsHaveWorkflows } from '@/store/modules/dataset/utils'
import { DatasetItemStatus } from '@/store/types/DatasetItemStatus'
import { constructError } from '@/utils'
import { resetDatasetItems } from '@/utils/backend'

const noWorkflowsError = constructError(
  'DATASET_ITEMS_MISSING_WORKFLOWS',
  'Some of the selected items are already new or in an unsupported status, so they cannot be reset.'
)

/**
 * Resets all selected items to the "new" status.
 *
 * This will discard any annotations on the items, as well as moving the status
 * back to new, so it should be put behind a confirmation dialog
 */
export const resetSelectedItemsToNew: DatasetAction<void, []> = async (
  { commit, state }
) => {
  const { selectedItemIds: datasetItemIds } = state
  const items = state.datasetItems.filter(i => datasetItemIds.includes(i.id))

  if (!allItemsHaveWorkflows(items)) { return noWorkflowsError }

  const item = items[0]
  const { current_workflow: workflow } = item

  const stageNumbers = Object.keys(workflow.stages).map(k => parseInt(k))
  const finalStageNumber = Math.max(...stageNumbers)
  const workflowStageTemplateId = workflow.stages[finalStageNumber][0].workflow_stage_template_id
  const { dataset_id: datasetId } = item

  const response = await resetDatasetItems({
    datasetId,
    datasetItemIds,
    workflowStageTemplateId
  })

  if ('error' in response) { return response }

  commit('SET_ITEM_STATUS', { items, status: DatasetItemStatus.new })

  return response
}
