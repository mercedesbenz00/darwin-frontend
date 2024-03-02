import { WorkviewAction, StageAnnotation } from '@/store/modules/workview/types'
import { resolveNewAnnotationData } from '@/store/modules/workview/utils'
import { StageAnnotationPayload } from '@/store/types'
import {
  createStageAnnotation as backendCreateStageAnnotation,
  CreateStageAnnotationParams
} from '@/utils/backend'
import { createStageAnnotation as tutorialCreateStageAnnotation } from '@/utils/tutorialBackend'

class ActionError extends Error {
  constructor (message: string) {
    super(`workview/createStageAnnotation: ${message}`)
  }
}

const createStageAnnotation: WorkviewAction<Partial<StageAnnotationPayload>, StageAnnotation> =
  async ({ commit, dispatch, rootGetters, state }, annotation) => {
    commit('PUSH_STAGE_ANNOTATION', annotation)

    const stageResult = await dispatch('resolveStageForSelectedItem')
    if ('error' in stageResult) {
      commit('REMOVE_STAGE_ANNOTATION', annotation)
      return stageResult
    }

    if (!annotation.annotation_class_id) {
      throw new ActionError('Creating annotation without class assigned.')
    }

    if (!annotation.data) {
      throw new ActionError('Creating annotation without data.')
    }

    const params: CreateStageAnnotationParams = {
      id: annotation.id,
      annotationClassId: annotation.annotation_class_id,
      data: annotation.data,
      zIndex: annotation.z_index || undefined,
      stageId: stageResult.data.id
    }

    const response = state.tutorialMode
      ? tutorialCreateStageAnnotation(params)
      : await backendCreateStageAnnotation(params)

    if ('data' in response) {
      commit('UPDATE_STAGE_ANNOTATION', {
        annotation,
        data: resolveNewAnnotationData(response.data, rootGetters['aclass/mainAnnotationTypes'])
      })
      return { data: state.stageAnnotations.find(a => a.id === response.data.id) }
    } else {
      commit('SET_ERROR', response.error)
      commit('REMOVE_STAGE_ANNOTATION', annotation)
      return response
    }
  }

export default createStageAnnotation
