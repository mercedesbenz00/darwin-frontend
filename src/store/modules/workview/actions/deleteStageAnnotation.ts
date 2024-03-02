import { WorkviewAction, StageAnnotation } from '@/store/modules/workview/types'
import {
  deleteStageAnnotation as backendDeleteStageAnnotation,
  DeleteStageAnnotationParams
} from '@/utils/backend'
import { deleteStageAnnotation as tutorialDeleteStageAnnotation } from '@/utils/tutorialBackend'

const deleteStageAnnotation: WorkviewAction<StageAnnotation, StageAnnotation> =
  async ({ commit, dispatch, state }, payload) => {
    const annotation = state.stageAnnotations.find(a => a.id === payload.id)
    if (!annotation) { return { data: payload } }

    // optimistic UI
    commit('REMOVE_STAGE_ANNOTATION', annotation)

    if (!annotation.id) { return { data: annotation } }

    const stageResult = await dispatch('resolveStageForSelectedItem')
    if ('error' in stageResult) {
      commit('PUSH_STAGE_ANNOTATION', annotation)
      return stageResult
    }

    const params: DeleteStageAnnotationParams = {
      id: annotation.id,
      stageId: annotation.workflow_stage_id
    }

    const response = state.tutorialMode
      ? tutorialDeleteStageAnnotation(params)
      : await backendDeleteStageAnnotation(params)

    if ('error' in response) {
      // rollback
      commit('PUSH_STAGE_ANNOTATION', annotation)
      commit('SET_ERROR', response.error)
      return response
    }

    return { data: annotation }
  }

export default deleteStageAnnotation
