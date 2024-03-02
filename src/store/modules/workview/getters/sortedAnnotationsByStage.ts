import { Getter } from 'vuex'

import { WorkviewState } from '@/store/modules/workview/state'
import { StageAnnotation } from '@/store/modules/workview/types'
import { getSortedAnnotationsByStage } from '@/store/modules/workview/utils'
import { RootState, WorkflowStagePayload } from '@/store/types'

/**
 * Get annotations by stage
 */
export const sortedAnnotationsByStage: Getter<WorkviewState, RootState> =
  (state, getters, rootState, rootGetters) =>
    (stage: WorkflowStagePayload | null): StageAnnotation[] => {
      const isVersion2: boolean = rootGetters['dataset/isVersion2']
      return getSortedAnnotationsByStage(state.stageAnnotations, stage, isVersion2)
    }
