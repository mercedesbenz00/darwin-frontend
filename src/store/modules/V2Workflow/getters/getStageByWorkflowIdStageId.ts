import { Getter } from 'vuex'

import { RootState, V2Workflows, V2WorkflowStagePayload } from '@/store/types'

export const getStageByWorkflowIdStageId: Getter<V2Workflows, RootState> = (state) => (
  workflowId: string,
  id: string
): V2WorkflowStagePayload | undefined => {
  const workflowIndex = state.workflows.findIndex(({ id }) => id === workflowId)
  if (workflowIndex < 0) { return }
  const { stages } = state.workflows[workflowIndex]
  return stages.find((el) => el.id === id)
}
