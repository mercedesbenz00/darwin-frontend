import { DatasetAction } from '@/store/modules/dataset/types'
import { allItemsNotNew, allItemsHaveWorkflows } from '@/store/modules/dataset/utils'
import { DatasetItemStatus } from '@/store/types/DatasetItemStatus'
import { constructError } from '@/utils'
import { setDatasetItemsStage } from '@/utils/backend'

const newItemsError = constructError(
  'DATASET_ITEMS_NEW',
  [
    'You cannot mark New images as Complete right away.',
    'Assign them to a user first, then mark as Complete.'
  ].join(' ')
)

const noWorkflowsError = constructError(
  'DATASET_ITEMS_MISSING_WORKFLOWS',
  "Couldn't mark as Complete. Assign them to a user first to have them enter a workflow."
)

const mismatchedWorkflowsError = constructError(
  'DATASET_ITEMS_SELECTION_INVALID',
  "Couldn't mark as Complete. All selected items must have the same workflow."
)

/**
 * Highly specialized action which marks all selected items as completed
 *
 * Items must all have current workflows and those workflows must all come
 * from the same template.
 *
 * Support for mixing workflows is planned, but not clear if worth it before
 * workflows 2.0.
 */
export const markSelectedItemsCompleted: DatasetAction<void, []> = async (
  { commit, state }
) => {
  const { selectedItemIds: datasetItemIds } = state
  const items = state.datasetItems.filter(i => datasetItemIds.includes(i.id))

  if (items.length && !allItemsNotNew(items)) { return newItemsError }

  if (!allItemsHaveWorkflows(items)) { return noWorkflowsError }

  const item = items[0]
  const { current_workflow: workflow } = item

  const allItemsHaveSameWorkflows = items.every(
    i => i.current_workflow &&
    i.current_workflow.workflow_template_id === workflow.workflow_template_id
  )
  if (!allItemsHaveSameWorkflows) { return mismatchedWorkflowsError }

  const stageNumbers = Object.keys(workflow.stages).map(k => parseInt(k))
  const finalStageNumber = Math.max(...stageNumbers)
  const workflowStageTemplateId = workflow.stages[finalStageNumber][0].workflow_stage_template_id
  const { dataset_id: datasetId } = item

  const response = await setDatasetItemsStage({
    datasetId,
    datasetItemIds,
    workflowStageTemplateId
  })

  if ('error' in response) { return response }

  commit('SET_STAGE_NUMBER', { items, stageNumber: finalStageNumber })
  commit('SET_ITEM_STATUS', { items, status: DatasetItemStatus.complete })

  return response
}
