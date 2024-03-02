import { WorkflowMutation } from '@/store/modules/V2Workflow/types'
import { StageType } from '@/store/types/StageType'

export const REMOVE_STAGE: WorkflowMutation<string> = (state, stageId) => {
  const stageIdsToRemove = [stageId]
  const draft = state.editedWorkflow

  if (!draft) {
    return
  }

  const stage = draft.stages.find(({ id }) => id === stageId)
  if (stage?.type === StageType.ConsensusEntrypoint) {
    stageIdsToRemove.push(
      stage.config.test_stage_id,
      ...stage.config.parallel_stage_ids
    )
  }

  draft.stages = draft.stages
    .filter(({ id }) => !stageIdsToRemove.includes(id))
    .map((s) =>
      s.type === StageType.ConsensusEntrypoint
        ? {
          ...s,
          config: {
            ...s.config,
            parallel_stage_ids: s.config.parallel_stage_ids.filter(
              (id) => id !== stageId
            ),
          },
        }
        : s
    )
}
