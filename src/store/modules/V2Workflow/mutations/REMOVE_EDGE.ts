import { WorkflowMutation } from '@/store/modules/V2Workflow/types'

export type Payload = {
  sourceStageId?: string;
  targetStageId?: string;
  name?: string;
};

export const REMOVE_EDGE: WorkflowMutation<Payload> = (
  state,
  { sourceStageId, targetStageId, name }
) => {
  if (!state.editedWorkflow) {
    return
  }
  if (sourceStageId && !targetStageId) {
    const stage = state.editedWorkflow.stages.find(
      (stage) => stage.id === sourceStageId
    )
    if (!stage) {
      return
    }
    stage.edges = stage.edges.filter((e) => e.name !== name)
    return
  }

  const stage = sourceStageId
    ? state.editedWorkflow.stages.find((s) =>
      s.edges.some(
        (e) =>
          e.source_stage_id === sourceStageId &&
            e.target_stage_id === targetStageId
      )
    )
    : state.editedWorkflow.stages.find((s) =>
      s.edges.some((e) => e.target_stage_id === targetStageId)
    )

  if (!stage) {
    return
  }

  const edge = !!sourceStageId
    ? stage.edges.find(
      (e) =>
        e.source_stage_id === sourceStageId &&
          e.target_stage_id === targetStageId
    )
    : stage.edges.find((e) => e.target_stage_id === targetStageId)

  if (!edge) {
    return
  }

  stage.edges = stage.edges.filter((e) => e.id !== edge.id)
}
