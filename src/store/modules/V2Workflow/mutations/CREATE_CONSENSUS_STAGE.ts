import { WorkflowMutation } from '@/store/modules/V2Workflow/types'
import { V2WorkflowStagePayload } from '@/store/types/V2WorkflowStagePayload'

export const CREATE_CONSENSUS_STAGE: WorkflowMutation<V2WorkflowStagePayload[]> = (
  state,
  stages
) => {
  state.editedWorkflow?.stages.push(...stages)
}
