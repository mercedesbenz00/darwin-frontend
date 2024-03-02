import { WorkviewAction } from '@/store/modules/workview/types'
import { WorkflowStagePayload } from '@/store/types/WorkflowStagePayload'
import {
  setStageAutoComplete as backendSetStageAutoComplete,
  SetStageAutoCompleteParams
} from '@/utils/backend'
import { setStageAutoComplete as tutorialSetStageAutoComplete } from '@/utils/tutorialBackend'

export const setStageAutoComplete: WorkviewAction<WorkflowStagePayload, WorkflowStagePayload> =
  async ({ commit, state }, stage) => {
    const params: SetStageAutoCompleteParams = { stageId: stage.id }

    const response = state.tutorialMode
      ? tutorialSetStageAutoComplete(params)
      : await backendSetStageAutoComplete(params)

    if ('data' in response) {
      commit('PUSH_STAGE', response.data)
    } else {
      commit('SET_ERROR', response.error)
    }

    return response
  }
