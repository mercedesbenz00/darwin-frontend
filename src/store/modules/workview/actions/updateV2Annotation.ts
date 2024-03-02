import { WorkviewAction, StageAnnotation } from '@/store/modules/workview/types'
import { V2WorkflowCommandResponse } from '@/store/types/V2WorkflowCommandResponse'
import { constructError } from '@/utils'
import { sendV2Commands } from '@/utils/backend'
import { ErrorCodes } from '@/utils/error/errors'

class ActionError extends Error {
  constructor (message: string) {
    super(`workview/updateStageAnnotation: ${message}`)
  }
}

type Action = WorkviewAction<StageAnnotation, V2WorkflowCommandResponse>

export const updateV2Annotation: Action =
  async ({ commit, state }, payload) => {
    if (!state.dataset) {
      throw new ActionError('Trying to update annotation without dataset set')
    }

    if (!state.selectedDatasetItemV2Id) { throw new ActionError('Item not set') }

    if (!payload.id) {
      return constructError(ErrorCodes.UPDATING_ANNOTATION_WITHOUT_ID)
    }

    const annotation = state.stageAnnotations.find(a => a.id === payload.id)
    if (!annotation) { throw new ActionError('Trying to update unknown annotation') }

    const previousData = { ...annotation }

    const stageInstance = state.v2SelectedStageInstance
    if (!stageInstance) { throw new ActionError('StageInstance not available.') }

    // optimistic UI
    commit('UPDATE_STAGE_ANNOTATION', { annotation, data: payload })

    const params: Parameters<typeof sendV2Commands>[0] = {
      commands: [{
        type: 'update_annotation',
        data: {
          annotation_class_id: payload.annotation_class_id,
          data: payload.data,
          annotation_id: payload.id,
          context_keys: payload.context_keys,
          z_index: payload.z_index !== undefined ? payload.z_index : null,
          stage_id: stageInstance.stage_id,
          metadata: {}
        }
      }],
      teamSlug: state.dataset.team_slug,
      datasetItemId: state.selectedDatasetItemV2Id
    }

    const response = await sendV2Commands(params)

    if ('error' in response) {
      // rollback
      commit('UPDATE_STAGE_ANNOTATION', { annotation, data: previousData })
      commit('SET_ERROR', response.error)
    }

    return response
  }

export default updateV2Annotation
