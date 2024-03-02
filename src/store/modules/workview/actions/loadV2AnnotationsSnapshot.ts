import { WorkviewAction } from '@/store/modules/workview/types'
import { resolveNewAnnotationData } from '@/store/modules/workview/utils'
import { StageAnnotationPayload, V2DatasetItemPayload } from '@/store/types'
import { loadV2AnnotationsSnapshot as request } from '@/utils/backend'

type Payload = {
  datasetItemId: V2DatasetItemPayload['id'],
  snapshotId: string
}

export const loadV2AnnotationsSnapshot: WorkviewAction<Payload, StageAnnotationPayload[]> =
  async ({ commit, rootGetters, rootState, state }, { datasetItemId, snapshotId }) => {
    const { currentTeam } = rootState.team
    if (!currentTeam) {
      throw Error('Attempted to fetch annotation snapshot without a selected team')
    }

    if (!datasetItemId) { throw new Error('Dataset item not set') }

    let response = null

    const params = {
      teamSlug: currentTeam.slug,
      datasetItemId,
      snapshotId
    }
    response = await request(params)

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
