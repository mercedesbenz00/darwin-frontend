import { WorkflowMutation } from '@/store/modules/workview/types'
import { WorkflowStagePayload } from '@/store/types/WorkflowStagePayload'

type AssignStageMutation = WorkflowMutation<{ stage: WorkflowStagePayload, userId: number}>

/** Assign a workflow stage to a user */
export const ASSIGN_STAGE: AssignStageMutation = (state, { stage, userId }) => {
  stage.assignee_id = userId
}
