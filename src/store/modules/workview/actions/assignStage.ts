import { WorkviewAction } from '@/store/modules/workview/types'
import { WorkflowStagePayload } from '@/store/types/WorkflowStagePayload'
import { assignStage as backendAssignStage } from '@/utils/backend'
import { assignStage as tutorialAssignStage } from '@/utils/tutorialBackend'

type AssignStageAction = WorkviewAction<
  { stage: WorkflowStagePayload, userId: number },
  WorkflowStagePayload
>

export const assignStage: AssignStageAction = async (
  { commit, dispatch, state },
  { stage, userId }
) => {
  const params = { stageId: stage.id, userId }

  const response = state.tutorialMode
    ? tutorialAssignStage(params)
    : await backendAssignStage(params)

  if ('data' in response) {
    commit('ASSIGN_STAGE', { stage, userId })
    await dispatch('updateStageParents', response.data)
  }

  return response
}
