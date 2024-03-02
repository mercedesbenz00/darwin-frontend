import { Getter } from 'vuex'

import { WorkviewState } from '@/store/modules/workview/state'
import { StageAnnotation } from '@/store/modules/workview/types'
import { RootState } from '@/store/types'

/**
 * Returns the current selected annotation
 */
export const selectedAnnotation: Getter<WorkviewState, RootState> =
  (state): StageAnnotation | null => {
    const { stageAnnotations } = state
    return stageAnnotations.find(annotation => annotation.isSelected) || null
  }
