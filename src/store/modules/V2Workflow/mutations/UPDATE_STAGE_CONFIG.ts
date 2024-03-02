import { WorkflowMutation } from '@/store/modules/V2Workflow/types'
import { V2WorkflowStagePayload } from '@/store/types/V2WorkflowStagePayload'

type Payload = {
  stageId: string
  config: Partial<V2WorkflowStagePayload['config']>
} 

export const UPDATE_STAGE_CONFIG: WorkflowMutation<Payload> = (state, { stageId, config }) => {
  const workflow = state.editedWorkflow

  if (!workflow) { return }

  const stage = workflow.stages.find(({ id }) => id === stageId)
  if (!stage) { return }

  stage.config = {
    ...stage.config,
    ...config
  }
}
