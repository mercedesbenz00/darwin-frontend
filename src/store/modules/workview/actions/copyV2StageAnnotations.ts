import { WorkviewAction } from '@/store/modules/workview/types'
import { resolveNewAnnotationData } from '@/store/modules/workview/utils'
import { StageAnnotationPayload } from '@/store/types/StageAnnotationPayload'
import { Params, copyV2StageAnnotations as request } from '@/utils/backend/copyV2StageAnnotations'

type Payload = Params
type CopyStageAnnotations = WorkviewAction<Payload, StageAnnotationPayload[]>

export const copyV2StageAnnotations: CopyStageAnnotations =
  async ({ commit, rootGetters }, payload) => {
    commit('SET_COPYING_ANNOTATIONS', true)

    const response = await request(payload)

    commit('SET_COPYING_ANNOTATIONS', false)

    if ('data' in response) {
      commit('SET_STAGE_ANNOTATIONS', {
        wf2: true,
        annotations: response.data.map((annotation: any) => resolveNewAnnotationData(
          annotation,
          rootGetters['aclass/mainAnnotationTypes']
        ))
      })
    } else {
      commit('SET_ERROR', response.error)
    }

    return response
  }
