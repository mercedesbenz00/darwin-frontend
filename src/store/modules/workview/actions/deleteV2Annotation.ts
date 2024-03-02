import { WorkviewAction, StageAnnotation } from '@/store/modules/workview/types'
import { sendV2Commands } from '@/utils/backend'

class ActionError extends Error {
  constructor (message: string) {
    super(`workview/deleteV2Annotation: ${message}`)
  }
}

export const deleteV2Annotation: WorkviewAction<StageAnnotation, StageAnnotation> =
  async ({ commit, state }, payload) => {
    if (!state.selectedDatasetItemV2Id) { throw new ActionError('Item not set') }
    if (!state.dataset) {
      throw new ActionError('Dataset not set')
    }
    const annotation = state.stageAnnotations.find(a => a.id === payload.id)
    if (!annotation) { return { data: payload } }

    // optimistic UI
    commit('REMOVE_STAGE_ANNOTATION', annotation)

    if (!annotation.id) { return { data: annotation } }

    const stageInstance = state.v2SelectedStageInstance

    if (!stageInstance) { throw new ActionError('StageInstance not available.') }

    const params: Parameters<typeof sendV2Commands>[0] = {
      commands: [{
        type: 'delete_annotation',
        data: {
          annotation_id: annotation.id,
          stage_id: stageInstance.stage_id
        }
      }],
      teamSlug: state.dataset.team_slug,
      datasetItemId: state.selectedDatasetItemV2Id
    }

    const response = await sendV2Commands(params)

    if ('error' in response) {
      // rollback
      commit('PUSH_STAGE_ANNOTATION', annotation)
      commit('SET_ERROR', response.error)
      return response
    }

    return { data: annotation }
  }
