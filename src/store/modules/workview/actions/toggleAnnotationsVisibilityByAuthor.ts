import { StageAnnotation, WorkviewAction } from '@/store/modules/workview/types'

/**
 * Show/Hide non-tag annotations by author from the Annotations Control Menu
 * If author is selected, it should hide annotations by that author
 * If author is not selected, it should show annotations by that author
 */
export const toggleAnnotationsVisibilityByAuthor: WorkviewAction<number, void> =
  ({ commit, getters, state }, userId) => {
    const selected = state.hiddenAuthorsMap[userId]
    const nonTagAnnotations = getters.selectedStageNonTagAnnotations as StageAnnotation[]

    if (selected) {
      commit('SHOW_ANNOTATIONS_BY_AUTHOR', userId)
    } else {
      commit('HIDE_ANNOTATIONS_BY_AUTHOR', userId)
    }

    const annotationIdsToToggle = nonTagAnnotations.filter((annotation) => {
      const actor = annotation.actors.find(a => a.user_id === userId)
      return !!actor
    }).map((annotation) => annotation.id)

    commit('UPDATE_ANNOTATIONS_VISIBILITY', {
      annotationIds: annotationIdsToToggle,
      visibility: !state.hiddenAuthorsMap[userId]
    })
  }
