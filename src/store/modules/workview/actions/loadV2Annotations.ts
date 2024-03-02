import { WorkviewAction } from '@/store/modules/workview/types'
import { resolveNewAnnotationData } from '@/store/modules/workview/utils'
import { StageAnnotationPayload, StageType, V2DatasetItemPayload } from '@/store/types'
import { loadV2Annotations as request } from '@/utils/backend'
import { loadStageAnnotations as tutorialLoadStageAnnotations } from '@/utils/tutorialBackend'

type Action = WorkviewAction<V2DatasetItemPayload['id'], StageAnnotationPayload[]>

export const loadV2Annotations: Action =
  async ({ commit, rootGetters, state, rootState }, datasetItemId) => {
    if (!datasetItemId) { throw new Error('Dataset item not set') }

    let response = null

    if (state.tutorialMode) {
      const params = { stageId: state.selectedStageInstance?.id || 1 }
      response = tutorialLoadStageAnnotations(params)
    } else {
      if (!state.dataset) { throw new Error('Dataset not available') }
      const annotationGroupIds = state.v2WorkflowItemState?.current_stage_instances
        .filter(si => si.user_id === rootState.user.profile?.id)
        .flatMap(si => {
          if (si.stage.type === StageType.Annotate) {
            return si.stage.config.annotation_group_id ?? []
          }
          return []
        }) ?? []

      response = await request({
        teamSlug: state.dataset.team_slug,
        datasetSlug: state.dataset.slug,
        datasetItemId,
        annotationGroupIds
      })
    }

    if ('data' in response) {
      // This is a temporary fix to attempt and boost render performance with a large number of
      // annotations. It will hide subannotations, requiring user to manually show them if they
      // so choose to
      if (response.data.length > 100 && state.renderSubAnnotations) {
        commit('TOGGLE_SUBANNOTATIONS')
      }

      commit('SET_STAGE_ANNOTATIONS', {
        wf2: true,
        annotations: response.data.map(annotation => resolveNewAnnotationData(
          annotation,
          rootGetters['aclass/mainAnnotationTypes']
        ))
      })
    }

    return response
  }
