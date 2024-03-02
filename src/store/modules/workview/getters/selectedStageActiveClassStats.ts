import { Getter } from 'vuex'

import { WorkviewState } from '@/store/modules/workview/state'
import { AnnotationClassStat, StageAnnotation } from '@/store/modules/workview/types'
import { AnnotationClassPayload, RootState } from '@/store/types'

/**
 * Stats of annotation classes which have been used in the selected stage
 */
export const selectedStageActiveClassStats: Getter<WorkviewState, RootState> =
  (state, getters): AnnotationClassStat[] => {
    const { hiddenClassesMap } = state
    const nonTagAnnotations = getters.selectedStageNonTagAnnotations as StageAnnotation[]
    const nonTagClasses = getters.nonTagAnnotationClasses as AnnotationClassPayload[]
    const classStats: Record<string, AnnotationClassStat> = nonTagClasses.reduce(
      (stats: Record<string, AnnotationClassStat>, aclass) => {
        stats[aclass.id] = {
          annotationClass: aclass,
          count: 0
        }
        return stats
      }, {}
    )

    nonTagAnnotations.forEach((annotation) => {
      classStats[annotation.annotation_class_id].count++
    })

    return Object.values(classStats)
      .filter((stat) => stat.count > 0 || hiddenClassesMap[stat.annotationClass.id])
  }
