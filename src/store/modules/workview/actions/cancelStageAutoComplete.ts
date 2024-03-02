import { WorkviewAction } from '@/store/modules/workview/types'
import { WorkflowStagePayload } from '@/store/types/WorkflowStagePayload'
import {
  cancelStageAutoComplete as backendCancelStageAutoComplete,
  CancelStageAutoCompleteParams
} from '@/utils/backend'
import { cancelStageAutoComplete as tutorialCancelStageAutoComplete } from '@/utils/tutorialBackend'

export const cancelStageAutoComplete: WorkviewAction<WorkflowStagePayload, WorkflowStagePayload> =
  async ({ commit, state }, stage) => {
    const params: CancelStageAutoCompleteParams = { stageId: stage.id }
    const response = state.tutorialMode
      ? tutorialCancelStageAutoComplete(params)
      : await backendCancelStageAutoComplete(params)

    if ('data' in response) {
      commit('PUSH_STAGE', response.data)
      commit('CANCEL_STAGE_AUTO_COMPLETE', response.data)
    }

    return response
  }
