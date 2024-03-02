import { StageAnnotation, WorkviewAction } from '@/store/modules/workview/types'

/**
 * Refresh annotations visibility based on the current annotations control menu status.
 * We should hide annotations whose annotation classes are selected to be hidden.
 */
export const refreshAnnotationsVisibility: WorkviewAction<void, void> =
  ({ commit, getters, state }) => {
    const { hiddenAuthorsMap, hiddenClassesMap } = state
    const nonTagAnnotations = getters.selectedStageNonTagAnnotations as StageAnnotation[]

    const classIdsToHide = Object.keys(hiddenClassesMap)
      .filter(classId => hiddenClassesMap[classId])
    const userIdsToHide = Object.keys(hiddenAuthorsMap)
      .filter(userId => hiddenAuthorsMap[userId])

    const annotationIdsToHide = nonTagAnnotations
      .filter((annotation) => {
        if (classIdsToHide.includes(annotation.annotation_class_id.toString())) {
          return true
        }
        if (!annotation.actors || annotation.actors.length === 0) {
          return false
        }
        return annotation.actors.some(actor =>
          actor.role === 'annotator' && userIdsToHide.includes(actor.user_id?.toString())
        )
      })
      .map((annotation) => annotation.id)

    commit('UPDATE_ANNOTATIONS_VISIBILITY', {
      annotationIds: annotationIdsToHide,
      visibility: false
    })
  }
