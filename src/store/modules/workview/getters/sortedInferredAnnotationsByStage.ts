import { Getter } from 'vuex'

import { isVideoAnnotationData } from '@/engine/models'
import { WorkviewState } from '@/store/modules/workview/state'
import { StageAnnotation } from '@/store/modules/workview/types'
import { getSortedAnnotationsByStage } from '@/store/modules/workview/utils'
import { RootState, WorkflowStagePayload } from '@/store/types'

/**
 * Get annotations in the current frame(video) from the current selected stage instance
 */
export const sortedInferredAnnotationsByStage: Getter<WorkviewState, RootState> = (state) =>
  (stage: WorkflowStagePayload, wf2: boolean, currentFrameIndex?: number): StageAnnotation[] =>
    getSortedAnnotationsByStage(state.stageAnnotations, stage, wf2)
      .filter(a => {
        if (!isVideoAnnotationData(a.data) || currentFrameIndex === undefined) { return true }
        return a
          .data
          .segments
          ?.find(segment => segment[0] <= currentFrameIndex &&
            // assumes segment second is `null` it's should be full video wide
            (segment[1] === null || currentFrameIndex < segment[1]))
      })
