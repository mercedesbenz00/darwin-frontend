import { DatasetMutation } from '@/store/modules/dataset/types'

import { PUSH_DATASET_ITEMS } from './PUSH_DATASET_ITEMS'

export const ASSIGN_SELECTED_ITEMS: DatasetMutation<number> = (state, assigneeId) => {
  const affectedItems = state.selectedAll
    ? state.datasetItems
    : state.datasetItems.filter(i => state.selectedItemIds.includes(i.id))

  PUSH_DATASET_ITEMS(
    state,
    affectedItems.map(item => {
      // locally assigning 1.0 workflow
      if (item.current_workflow) {
        const stageNumber = item.current_workflow.current_stage_number
        const currentStages = item.current_workflow.stages[stageNumber]
        item.current_workflow.stages[stageNumber] =
          currentStages.map(s => ({ ...s, assignee_id: assigneeId }))
      }

      // locally assigning 2.0 workflow
      if (item.workflow_item) {
        const instances = item.workflow_item.current_stage_instances
        item.workflow_item.current_stage_instances =
          instances.map(i => ({ ...i, user_id: assigneeId }))
        const stageId = instances[0].stage_id
        const stage = item.workflow_item.workflow.stages.find(s => s.id === stageId)

        if (stage) {
          item.workflow_item.designated_assignees[stage.id] = assigneeId
        }
      }

      return item
    })
  )
}
