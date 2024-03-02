import { WorkviewAction } from '@/store/modules/workview/types'
import { WorkflowStagePayload } from '@/store/types/WorkflowStagePayload'
import {
  setStageReviewStatus as backendSetStageReviewStatus,
  SetStageReviewStatusParams
} from '@/utils/backend'
import { setStageReviewStatus as tutorialSetStageReviewStatus } from '@/utils/tutorialBackend'

const resetStageReviewStatus: WorkviewAction<WorkflowStagePayload, WorkflowStagePayload> =
  async ({ commit, state }, stage) => {
    const params: SetStageReviewStatusParams = { stageId: stage.id, status: null }

    const response = state.tutorialMode
      ? tutorialSetStageReviewStatus(params)
      : await backendSetStageReviewStatus(params)

    if ('data' in response) {
      commit('PUSH_STAGE', response.data)
      commit('CANCEL_STAGE_AUTO_COMPLETE', response.data)
    } else {
      commit('SET_ERROR', response.error)
    }
    return response
  }

export default resetStageReviewStatus
