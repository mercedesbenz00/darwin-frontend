import { WorkviewAction } from '@/store/modules/workview/types'
import { WorkflowStagePayload } from '@/store/types/WorkflowStagePayload'
import { skipStage as backendSkipStage, SkipStageParams } from '@/utils/backend'
import { skipStage as tutorialSkipStage } from '@/utils/tutorialBackend'

type SkipStageActionParams = {
  stage: WorkflowStagePayload,
  reason: WorkflowStagePayload['skipped_reason']
}

const skipStage: WorkviewAction<SkipStageActionParams, WorkflowStagePayload> =
  async ({ commit, state }, { stage, reason }) => {
    const params: SkipStageParams = { stageId: stage.id, reason }

    const response = state.tutorialMode
      ? tutorialSkipStage(params)
      : await backendSkipStage(params)

    if ('data' in response) {
      commit('PUSH_STAGE', response.data)
    } else {
      commit('SET_ERROR', response.error)
    }

    return response
  }

export default skipStage
