import { WorkviewAction } from '@/store/modules/workview/types'
import { resolveNewAnnotationData } from '@/store/modules/workview/utils'
import { WorkflowStagePayload, StageAnnotationPayload } from '@/store/types'
import { loadStageAnnotations as backendLoadStageAnnotations } from '@/utils/backend'
import { loadStageAnnotations as tutorialLoadStageAnnotations } from '@/utils/tutorialBackend'

const loadStageAnnotations: WorkviewAction<WorkflowStagePayload, StageAnnotationPayload[]> =
  async ({ commit, rootGetters, state }, stage) => {
    const params = { stageId: stage.id }

    const response = state.tutorialMode
      ? tutorialLoadStageAnnotations(params)
      : await backendLoadStageAnnotations(params)

    if ('data' in response) {
      // This is a temporary fix to attempt and boost render performance with a large number of
      // annotations. It will hide subannotations, requiring user to manually show them if they
      // so choose to
      if (response.data.length > 100 && state.renderSubAnnotations) {
        commit('TOGGLE_SUBANNOTATIONS')
      }

      commit('SET_STAGE_ANNOTATIONS', {
        stage,
        annotations: response.data.map(annotation => resolveNewAnnotationData(
          annotation,
          rootGetters['aclass/mainAnnotationTypes']
        ))
      })
    }

    return response
  }

export default loadStageAnnotations
