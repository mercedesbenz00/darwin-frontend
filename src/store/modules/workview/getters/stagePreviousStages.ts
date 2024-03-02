import { Getter } from 'vuex'

import { WorkviewState } from '@/store/modules/workview/state'
import { WorkflowStagePayload, RootState } from '@/store/types'
import { DatasetItemPayload } from '@/store/types/DatasetItemPayload'

/**
 * Match the stage with it's parent workflow within the specified list,
 * then retrieve a list of stage instances which are next in the workflow
 */
const getPreviousStages = (stage: WorkflowStagePayload, items: DatasetItemPayload[]) => {
  const item = items.find(i => i.current_workflow_id === stage.workflow_id)

  // stages are only ever loaded through items, so if this has no results, it's a bug
  if (!item || !item.current_workflow) { throw new Error("Couldn't resolve item for stage") }

  const currentStageNumber = item.current_workflow.current_stage_number
  return item.current_workflow.stages[currentStageNumber - 1]
}

export const stagePreviousStages: Getter<WorkviewState, RootState> = (state) =>
  (stage: WorkflowStagePayload) => getPreviousStages(stage, state.datasetItems)
