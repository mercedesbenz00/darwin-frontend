import { Getter } from 'vuex'

import { WorkviewState } from '@/store/modules/workview/state'
import { AnnotationActorStat, StageAnnotation } from '@/store/modules/workview/types'
import { RootState } from '@/store/types'

/**
 * Stats of actors who have annotated in the selected stage
 */
export const selectedStageActiveActorStats: Getter<WorkviewState, RootState> =
  (state, getters): AnnotationActorStat[] => {
    const nonTagAnnotations = getters.selectedStageNonTagAnnotations as StageAnnotation[]
    const actorsStats: Record<string, AnnotationActorStat> = {}

    nonTagAnnotations.forEach(annotation => {
      if (!annotation.actors || annotation.actors.length === 0) { return }

      annotation.actors.forEach(actor => {
        if (actor.role !== 'annotator') { return }
        if (!actorsStats[actor.user_id]) {
          actorsStats[actor.user_id] = {
            actor,
            count: 0
          }
        }
        actorsStats[actor.user_id].count++
      })
    })

    return Object.values(actorsStats)
  }
