import { StageAnnotation, WorkviewAction } from '@/store/modules/workview/types'
import { StageAnnotationPayload } from '@/store/types'
import { constructError, ParsedError } from '@/utils'
import {
  updateStageAnnotation as backendUpdateStageAnnotation,
  UpdateStageAnnotationParams
} from '@/utils/backend/updateStageAnnotation'
import { ErrorCodes } from '@/utils/error/errors'
import { updateStageAnnotation as tutorialUpdateStageAnnotation } from '@/utils/tutorialBackend'

const UNIQUE_ID_ERROR_MESSAGE = 'ID must be unique'

class ActionError extends Error {
  constructor (message: string) {
    super(`workview/updateStageAnnotation: ${message}`)
  }
}

const updateStageAnnotation: WorkviewAction<StageAnnotation, StageAnnotation> =
  async ({ commit, dispatch, state }, payload) => {
    if (!payload.id) {
      return constructError(ErrorCodes.UPDATING_ANNOTATION_WITHOUT_ID)
    }

    let annotation = state.stageAnnotations.find(a => a.id === payload.id)
    if (!annotation) {
      console.error('Trying to update unknown annotation')
      // Clear annotation before re-create
      commit('REMOVE_STAGE_ANNOTATION', payload)

      // Try to re-create annotation
      const response = await dispatch('createStageAnnotation', payload)

      if ('data' in response) {
        const annotation = state.stageAnnotations.find(a => a.id === payload.id)
        if (!annotation) {
          throw new ActionError("Something went wrong! Can't get created annotation!")
        }
        return { data: annotation }
      }

      if ('error' in response) {
        // If API has target annotation
        if (response.error.id === UNIQUE_ID_ERROR_MESSAGE) {
          // Push it to the store
          commit('PUSH_STAGE_ANNOTATION', payload)
          annotation = payload
        } else {
          return response
        }
      }
    }

    const previousData = { ...annotation }

    // optimistic UI
    commit('UPDATE_STAGE_ANNOTATION', { annotation, data: payload })

    const stageResult = await dispatch('resolveStageForSelectedItem')
    if ('error' in stageResult) {
      // rollback
      commit('UPDATE_STAGE_ANNOTATION', { annotation, data: previousData })
      // To trigger annotationManager recalculation
      commit('SET_STAGE_ANNOTATIONS', {})
      throw new ActionError(stageResult.error.message)
    }

    const params: UpdateStageAnnotationParams = {
      annotationClassId: payload.annotation_class_id,
      data: payload.data,
      id: payload.id,
      stageId: payload.workflow_stage_id,
      zIndex: payload.z_index !== null ? payload.z_index : undefined
    }
    const response: { data: StageAnnotationPayload } | ParsedError = state.tutorialMode
      ? tutorialUpdateStageAnnotation(params)
      : await backendUpdateStageAnnotation(params)

    if ('error' in response) {
      // rollback
      commit('UPDATE_STAGE_ANNOTATION', { annotation, data: previousData })
      commit('SET_ERROR', response.error)
      // To trigger annotationManager recalculation
      commit('SET_STAGE_ANNOTATIONS', {})
      return response
    }

    const updatedAnnotation = state.stageAnnotations.find(a => a.id === payload.id)
    if (!updatedAnnotation) {
      throw new ActionError("Something went wrong! Can't get created annotation!")
    }
    return { data: updatedAnnotation }
  }

export default updateStageAnnotation
