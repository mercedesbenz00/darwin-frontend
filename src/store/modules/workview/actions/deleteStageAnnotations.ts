import { StageAnnotation, WorkviewAction } from '@/store/modules/workview/types'
import {
  deleteStageAnnotations as backendDeleteStageAnnotations,
  DeleteStageAnnotationsParams
} from '@/utils/backend'
import { deleteStageAnnotations as tutorialDeleteStageAnnotations } from '@/utils/tutorialBackend'

type DeleteStageAnnotationsAction = WorkviewAction<StageAnnotation[], StageAnnotation[]>

const deleteStageAnnotations: DeleteStageAnnotationsAction =
  async ({ commit, state }, payload) => {
    // optimistic UI
    commit('REMOVE_STAGE_ANNOTATIONS', payload)

    const params: DeleteStageAnnotationsParams = {
      ids: payload.filter((a) => !!a.id).map(a => a.id as string),
      stageId: payload[0].workflow_stage_id
    }

    const response = state.tutorialMode
      ? tutorialDeleteStageAnnotations(params)
      : await backendDeleteStageAnnotations(params)

    if ('error' in response) {
      // rollback
      commit('PUSH_STAGE_ANNOTATIONS', payload)
      commit('SET_ERROR', response.error)
      return response
    }

    return { data: payload }
  }

export default deleteStageAnnotations
