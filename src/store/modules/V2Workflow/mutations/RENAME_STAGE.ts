import { WorkflowMutation } from '@/store/modules/V2Workflow/types'

export const RENAME_STAGE: WorkflowMutation<{ id: string, name: string }> =
  (state, { id, name }) => {
    const workflow = state.editedWorkflow

    if (!workflow) { return }

    const stageIndex = workflow.stages.findIndex((stage) => stage.id === id)
    if (stageIndex === -1) { return }
    workflow.stages[stageIndex].name = name

    state.editedWorkflow = workflow
  }
