import { Getter } from 'vuex'

import { WorkviewState } from '@/store/modules/workview/state'
import {
  DatasetItemPayload,
  RootState,
  WorkflowStagePayload
} from '@/store/types'

/**
 * Returns all instances for the current stage of the workflow, for the specified dataset item
 */
export const currentStageInstancesForItem: Getter<WorkviewState, RootState> = () =>
  (item: DatasetItemPayload): WorkflowStagePayload[] => {
    if (!item.current_workflow) { return [] }
    const stageNumber = item.current_workflow.current_stage_number
    return item.current_workflow.stages[stageNumber]
  }
