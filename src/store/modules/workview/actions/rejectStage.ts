import { WorkviewAction } from '@/store/modules/workview/types'
import { ReviewStatus } from '@/store/types/ReviewStatus'
import { WorkflowStagePayload } from '@/store/types/WorkflowStagePayload'
import {
  setStageReviewStatus as backendSetStageReviewStatus,
  SetStageReviewStatusParams
} from '@/utils/backend'
import { setStageReviewStatus as tutorialSetStageReviewStatus } from '@/utils/tutorialBackend'

export const rejectStage: WorkviewAction<WorkflowStagePayload, WorkflowStagePayload> =
  async ({ commit, state }, stage) => {
    const params: SetStageReviewStatusParams = { stageId: stage.id, status: ReviewStatus.Rejected }

    const response = state.tutorialMode
      ? tutorialSetStageReviewStatus(params)
      : await backendSetStageReviewStatus(params)

    if ('data' in response) {
      commit('PUSH_STAGE', response.data)
    } else {
      commit('SET_ERROR', response.error)
    }

    return response
  }
