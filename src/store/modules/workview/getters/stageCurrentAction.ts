import { Getter } from 'vuex'

import { WorkviewState } from '@/store/modules/workview/state'
import { mapStageActiontype } from '@/store/modules/workview/utils/mapStageActionType'
import {
  DatasetItemPayload,
  ReviewStatus,
  RootState,
  StageActionType,
  StageType,
  WorkflowStagePayload
} from '@/store/types'

/**
 * From stages listed in item, return all stage instances with the
 * next stage number of the specified stage.
 */
const getNextStages = (
  stage: WorkflowStagePayload,
  item: DatasetItemPayload
): WorkflowStagePayload[] => {
  if (!item.current_workflow) { throw new Error("Couldn't resolve workflow for stage") }
  const currentStagesEntry = Object
    .entries(item.current_workflow.stages)
    .find(([, stages]) => stages.some(s => s.id === stage.id))

  if (!currentStagesEntry) { throw new Error('Incorrectly matched stage with workflow.') }

  const currentStageNumber = parseInt(currentStagesEntry[0])
  return item.current_workflow.stages[currentStageNumber + 1]
}

const getNextStage = (
  stage: WorkflowStagePayload,
  state: WorkviewState
): WorkflowStagePayload => {
  const item = state.datasetItems.find(i => i.current_workflow_id === stage.workflow_id)
  if (!item) { throw new Error("Couldn't resolve workflow for stage") }
  return getNextStages(stage, item)[0]
}

/**
 * For the specified stage, returns the type of action which is to happen upon stage completion
 *
 * Used to decide what the continue button performs when clicking,
 * and to render what happens when autom-complete runs out.
 */
export const stageCurrentAction: Getter<WorkviewState, RootState> =
  (state) => (currentStage: WorkflowStagePayload): StageActionType => {
    if (currentStage.type === StageType.Annotate && currentStage.skipped) {
      return StageActionType.Skip
    }

    if (currentStage.type === StageType.Review) {
      const reviewStatus = currentStage.metadata.review_status
      if (reviewStatus === ReviewStatus.Archived) { return StageActionType.Archive }
      if (reviewStatus === ReviewStatus.Rejected) { return StageActionType.SendBack }
    }

    const nextStage = getNextStage(currentStage, state)

    return mapStageActiontype(currentStage.type, nextStage.type)
  }
