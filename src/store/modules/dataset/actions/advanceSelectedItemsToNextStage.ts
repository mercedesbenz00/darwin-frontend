import { DatasetAction } from '@/store/modules/dataset/types'
import { allItemsHaveWorkflows } from '@/store/modules/dataset/utils'
import { constructError, STAGE_TYPE_TO_ITEM_STATUS } from '@/utils'
import { setDatasetItemsStage } from '@/utils/backend'

const noWorkflowsError = constructError(
  'DATASET_ITEMS_MISSING_WORKFLOWS',
  [
    'You cannot advance New images to the next stage.',
    'Assign them to a user first to have them enter a workflow.'
  ].join(' ')
)

const mismatchedWorkflowsError = constructError(
  'DATASET_ITEMS_SELECTION_INVALID',
  "Couldn't update items. All selected items must have the same workflow and be in the same stage."
)

/**
 * Highly specialized action which advances all selected items to next stage.
 *
 * Items must all have current workflows and those workflows must all come
 * from the same template and be in the same stage.
 *
 * Support for mixing workflows is planned, but not clear if worth it before
 * workflows 2.0.
 */
export const advanceSelectedItemsToNextStage: DatasetAction<void, []> = async (
  { commit, state }
) => {
  const { selectedItemIds: datasetItemIds } = state
  const items = state.datasetItems.filter(i => datasetItemIds.includes(i.id))

  if (!allItemsHaveWorkflows(items)) { return noWorkflowsError }

  const item = items[0]
  const { current_workflow: workflow } = item

  const allItemsHaveSameStage =
    items.every(({ current_workflow: w }) =>
      w.current_workflow_stage_template_id === workflow.current_workflow_stage_template_id
    )
  if (!allItemsHaveSameStage) { return mismatchedWorkflowsError }

  const stageNumbers = Object.keys(workflow.stages).map(k => parseInt(k))
  const finalStageNumber = Math.max(...stageNumbers)
  const nextStageNumber = Math.min(workflow.current_stage_number + 1, finalStageNumber)

  const nextStage = workflow.stages[nextStageNumber][0]

  const { dataset_id: datasetId } = item

  const response = await setDatasetItemsStage({
    datasetId,
    datasetItemIds,
    workflowStageTemplateId: nextStage.workflow_stage_template_id
  })

  if (!('error' in response)) {
    commit('SET_STAGE_NUMBER', { items, stageNumber: nextStage.number })
    commit('SET_ITEM_STATUS', { items, status: STAGE_TYPE_TO_ITEM_STATUS[nextStage.type] })
  }

  return response
}
