import { StageAnnotation, WorkviewAction } from '@/store/modules/workview/types'

/**
 * Show/Hide non-tag annotations by annotation class from the Annotations Control Menu
 * If annotation class is selected, it should hide annotations of that annotation class
 * If annotation class is not selected, it should show annotations of that annotation class
 */
export const toggleAnnotationsVisibilityByClass: WorkviewAction<number, void> =
  ({ commit, getters, state }, classId) => {
    const selected = state.hiddenClassesMap[classId]
    const nonTagAnnotations = getters.selectedStageNonTagAnnotations as StageAnnotation[]

    if (selected) {
      commit('SHOW_ANNOTATIONS_BY_CLASS', classId)
    } else {
      commit('HIDE_ANNOTATIONS_BY_CLASS', classId)
    }

    const annotationIdsToToggle = nonTagAnnotations
      .filter((annotation) => annotation.annotation_class_id === classId)
      .map((annotation) => annotation.id)

    commit('UPDATE_ANNOTATIONS_VISIBILITY', {
      annotationIds: annotationIdsToToggle,
      visibility: !state.hiddenClassesMap[classId]
    })
  }
