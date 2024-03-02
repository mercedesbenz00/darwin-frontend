import { Getter } from 'vuex'

import { isVideoAnnotationData } from '@/engine/models'
import { WorkviewState } from '@/store/modules/workview/state'
import { StageAnnotation } from '@/store/modules/workview/types'
import { getSortedAnnotationsByStage, tagClasses } from '@/store/modules/workview/utils'
import { RootState, WorkflowStagePayload } from '@/store/types'

/**
 * Get non-tag annotations from the current selected stage instance
 */
export const nonTagSortedAnnotationsByStage: Getter<WorkviewState, RootState> = (
  state,
  getters,
  rootState,
  rootGetters
) =>
  (stage: WorkflowStagePayload, currentFrameIndex?: number): StageAnnotation[] => {
    const tagIds = tagClasses(rootState.aclass).map(c => c.id)
    const isVersion2: boolean = rootGetters['dataset/isVersion2']
    return getSortedAnnotationsByStage(state.stageAnnotations, stage, isVersion2)
      .filter(a => !tagIds.includes(a.annotation_class_id))
      .filter(a => {
        if (!isVideoAnnotationData(a.data) || currentFrameIndex === undefined) { return true }
        return a.data.segments
          ?.find(segment => segment[0] <= currentFrameIndex && currentFrameIndex <= segment[1])
      })
  }
