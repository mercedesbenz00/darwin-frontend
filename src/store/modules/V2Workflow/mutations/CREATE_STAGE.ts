import { WorkflowMutation } from '@/store/modules/V2Workflow/types'
import { V2WorkflowStagePayload } from '@/store/types/V2WorkflowStagePayload'

export const CREATE_STAGE: WorkflowMutation<V2WorkflowStagePayload> = (state, stage) => {
  state.editedWorkflow?.stages.push(stage)
}
