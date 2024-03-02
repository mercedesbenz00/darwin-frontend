import { Getter } from 'vuex'

import { WorkviewState } from '@/store/modules/workview/state'
import { StageAnnotation } from '@/store/modules/workview/types'
import { RootState } from '@/store/types'

/**
 * Get non-tag annotations from the current selected stage instance
 */
export const selectedStageNonTagAnnotations: Getter<WorkviewState, RootState> =
  (state, getters, rootState, rootGetters): StageAnnotation[] => {
    const { selectedStageInstance } = state
    if (!selectedStageInstance && !rootGetters['dataset/isVersion2']) { return [] }

    return getters.nonTagSortedAnnotationsByStage(selectedStageInstance) as StageAnnotation[]
  }
