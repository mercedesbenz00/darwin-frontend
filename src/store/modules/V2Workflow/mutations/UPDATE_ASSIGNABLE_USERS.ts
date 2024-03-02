import { WorkflowMutation } from '@/store/modules/V2Workflow/types'
import { V2AnnotateStagePayload, V2ReviewStagePayload } from '@/store/types/V2WorkflowStagePayload'

/* eslint-disable camelcase */

type Payload = {
  stageId: string
  assignable_users: { user_id: number }[]
}

export const UPDATE_ASSIGNABLE_USERS: WorkflowMutation<Payload> = (
  state,
  { stageId, assignable_users }
) => {
  const workflow = state.editedWorkflow

  if (!workflow) { return }

  const stageIndex = workflow.stages.findIndex(({ id }) => id === stageId)
  if (stageIndex === -1) { return }

  const stage = workflow.stages[stageIndex] as V2ReviewStagePayload | V2AnnotateStagePayload

  stage.assignable_users = assignable_users

  state.editedWorkflow = workflow
}
/* eslint-enable camelcase */
