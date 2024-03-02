import { WorkviewAction, StageAnnotation } from '@/store/modules/workview/types'
import { V2WorkflowStagePayload } from '@/store/types'
import { sendV2Commands } from '@/utils/backend'

class ActionError extends Error {
  constructor (message: string) {
    super(`workview/createV2Annotation: ${message}`)
  }
}

type Action = WorkviewAction<Partial<StageAnnotation>, StageAnnotation>

export const createV2Annotation: Action = async ({ commit, state }, annotation) => {
  if (!state.selectedDatasetItemV2Id) { throw new ActionError('Item not set') }
  if (!annotation.annotation_class_id) {
    throw new ActionError('Creating annotation without class assigned.')
  }

  if (!annotation.data) {
    throw new ActionError('Creating annotation without data.')
  }

  if (!state.dataset) {
    throw new ActionError('Creating annotation without dataset set.')
  }

  // Auto-Start Workflow if not yet started and creating the first annotation
  const stageInstance = state.v2SelectedStageInstance
  const stage: V2WorkflowStagePayload | undefined = stageInstance?.stage

  if (!stageInstance) {
    throw new ActionError('StageInstance not available.')
  }

  if (!stage) {
    throw new ActionError('Stage not available.')
  }

  // optimistic UI
  commit('PUSH_STAGE_ANNOTATION', annotation)

  const params: Parameters<typeof sendV2Commands>[0] = {
    commands: [{
      type: 'create_annotation',
      data: {
        annotation_class_id: annotation.annotation_class_id,
        annotation_group_id: annotation.annotation_group_id,
        annotation_id: annotation.id,
        data: annotation.data,
        context_keys: annotation.context_keys,
        metadata: {},
        stage_id: stage.id,
        z_index: annotation.z_index !== undefined ? annotation.z_index : null
      }
    }],
    teamSlug: state.dataset.team_slug,
    datasetItemId: state.selectedDatasetItemV2Id
  }
  const response = await sendV2Commands(params)

  if ('data' in response) {
    return { data: annotation as StageAnnotation }
  } else {
    commit('SET_ERROR', response.error)
    commit('REMOVE_STAGE_ANNOTATION', annotation)
    return response
  }
}
