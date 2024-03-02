import { WorkflowMutation } from '@/store/modules/V2Workflow/types'

export const UNPLUG_STAGE: WorkflowMutation<string> = (state, stageId) => {
  const workflow = state.editedWorkflow

  if (!workflow) { return }

  workflow.stages = workflow.stages.map(stage => {
    const newEdges = stage.edges
      .filter(e => e.target_stage_id !== stageId && e.source_stage_id !== stageId)
    return { ...stage, edges: newEdges }
  })

  state.editedWorkflow = workflow
}
