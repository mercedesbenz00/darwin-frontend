import { WorkviewAction } from '@/store/modules/workview/types'
import { WorkflowStagePayload } from '@/store/types/WorkflowStagePayload'
import { unskipStage as backendUnskipStage, UnskipStageParams } from '@/utils/backend'
import { unskipStage as tutorialUnskipStage } from '@/utils/tutorialBackend'

const unskipStage: WorkviewAction<WorkflowStagePayload, WorkflowStagePayload> =
  async ({ commit, state }, stage) => {
    const params: UnskipStageParams = { stageId: stage.id }

    const response = state.tutorialMode
      ? tutorialUnskipStage(params)
      : await backendUnskipStage(params)

    if ('data' in response) {
      commit('PUSH_STAGE', response.data)
      commit('CANCEL_STAGE_AUTO_COMPLETE', response.data)
    }

    return response
  }

export default unskipStage
