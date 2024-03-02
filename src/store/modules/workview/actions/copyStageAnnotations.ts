import { SET_STAGE_ANNOTATIONS } from '@/store/modules/workview/mutations/SET_STAGE_ANNOTATIONS'
import { WorkviewAction } from '@/store/modules/workview/types'
import { resolveNewAnnotationData } from '@/store/modules/workview/utils'
import { StoreMutationPayload } from '@/store/types'
import { StageAnnotationPayload } from '@/store/types/StageAnnotationPayload'
import { WorkflowStagePayload } from '@/store/types/WorkflowStagePayload'
import {
  copyStageAnnotations as backendCopyStageAnnotations,
  CopyStageAnnotationsParams
} from '@/utils/backend'
import { copyStageAnnotations as tutorialCopyStageAnnotations } from '@/utils/tutorialBackend'

type Payload = { fromStage: WorkflowStagePayload, toStage: WorkflowStagePayload }
type CopyStageAnnotations = WorkviewAction<Payload, StageAnnotationPayload[]>

const copyAnnotations: CopyStageAnnotations =
  async ({ commit, state, rootGetters }, payload) => {
    commit('SET_COPYING_ANNOTATIONS', true)

    const { toStage, fromStage } = payload

    const params: CopyStageAnnotationsParams = {
      fromStageId: fromStage.id,
      toStageId: toStage.id
    }

    const response = state.tutorialMode
      ? tutorialCopyStageAnnotations(params)
      : await backendCopyStageAnnotations(params)

    commit('SET_COPYING_ANNOTATIONS', false)

    if ('data' in response) {
      const mutationPayload: StoreMutationPayload<typeof SET_STAGE_ANNOTATIONS> = {
        wf2: rootGetters['features/isFeatureEnabled']('WORKFLOW_2'),
        stage: toStage,
        annotations: response.data.map(annotation => resolveNewAnnotationData(
          annotation,
          rootGetters['aclass/mainAnnotationTypes']
        ))
      }
      commit('SET_STAGE_ANNOTATIONS', mutationPayload)
    } else {
      commit('SET_ERROR', response.error)
    }

    return response
  }

export default copyAnnotations
