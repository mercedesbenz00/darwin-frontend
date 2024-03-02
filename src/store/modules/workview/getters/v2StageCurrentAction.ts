import { Getter } from 'vuex'

import { WorkviewState } from '@/store/modules/workview/state'
import { mapStageActiontype } from '@/store/modules/workview/utils/mapStageActionType'
import {
  RootState,
  StageActionType,
  StageType,
  V2WorkflowItemStatePayload,
  V2WorkflowStageInstancePayload,
  V2WorkflowStagePayload,
  V2ConsensusStagePayload,
} from '@/store/types'

const getNextStage = (
  instance: V2WorkflowStageInstancePayload,
  itemState: V2WorkflowItemStatePayload
): V2WorkflowStagePayload | undefined =>
  itemState.workflow.stages.find(
    s => instance.stage.edges.some(
      // next stage is the implicit default next stage.
      // that means only certain edges are considered
      // - approve for review stage
      // - default for annotate stage (and all other stages)
      e => ['default', 'approve'].includes(e.name) && e.target_stage_id === s.id
    )
  )

/**
 * For the specified stage, returns the type of action which is to happen upon stage completion
 *
 * Used to decide what the continue button performs when clicking,
 * and to render what happens when autom-complete runs out.
 */
export const v2StageCurrentAction: Getter<WorkviewState, RootState> =
  (state): StageActionType | null => {
    const currentInstance = state.v2SelectedStageInstance
    if (!currentInstance) { return null }

    const currentType = currentInstance.stage.type
    const parallelStages =
        state.v2WorkflowItemState?.workflow.stages
          .filter(
            (stage): stage is V2ConsensusStagePayload =>
              stage.type === StageType.ConsensusEntrypoint
          )
          .flatMap((cs) => [
            ...cs.config.parallel_stage_ids,
          ]) ?? []

    const isSubAnnotate = currentType === StageType.Annotate &&
      parallelStages.includes(currentInstance.stage.id)

    if (isSubAnnotate) {
      return StageActionType.SendToTest
    }

    if (currentType === StageType.Annotate) {
      if (currentInstance.data.skipped_reason) { return StageActionType.Skip }
    }

    if (currentType === StageType.Review) {
      if (currentInstance.data.skipped_reason) { return StageActionType.Archive }
      if (currentInstance.data.active_edge === 'reject') { return StageActionType.SendBack }
    }

    if (currentType === StageType.Complete) {
      return StageActionType.Completed
    }

    if (!state.v2WorkflowItemState) { return null }

    const nextStage = getNextStage(currentInstance, state.v2WorkflowItemState)
    if (!nextStage) { return null }

    // Dataset can only be a starting stage, so should not happen
    if (nextStage.type === StageType.Dataset) { return null }

    return mapStageActiontype(currentInstance.stage.type, nextStage.type)
  }
