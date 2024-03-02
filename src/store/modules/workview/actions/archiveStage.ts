import { WorkviewAction } from '@/store/modules/workview/types'
import { ReviewStatus } from '@/store/types/ReviewStatus'
import { WorkflowStagePayload } from '@/store/types/WorkflowStagePayload'
import {
  setStageReviewStatus as request
} from '@/utils/backend'
import { setStageReviewStatus as tutorialRequest } from '@/utils/tutorialBackend'

export const archiveStage: WorkviewAction<WorkflowStagePayload, WorkflowStagePayload> =
  async ({ commit, state }, stage) => {
    const params: Parameters<typeof request>[0] = {
      stageId: stage.id,
      status: ReviewStatus.Archived
    }

    const response = state.tutorialMode
      ? tutorialRequest(params)
      : await request(params)

    if ('data' in response) {
      commit('PUSH_STAGE', response.data)
    } else {
      commit('SET_ERROR', response.error)
    }

    return response
  }
