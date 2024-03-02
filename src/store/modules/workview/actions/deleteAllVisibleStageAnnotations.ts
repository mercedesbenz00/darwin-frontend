import { StageAnnotation, WorkviewAction } from '@/store/modules/workview/types'

type DeleteAllVisibleStageAnnotationsAction = WorkviewAction<void, StageAnnotation[]>

const deleteAllVisibleStageAnnotations: DeleteAllVisibleStageAnnotationsAction =
  ({ dispatch, getters, state }) => {
    const nonTagAnnotations: StageAnnotation[] =
      getters.nonTagSortedAnnotationsByStage(state.selectedStageInstance)

    if (nonTagAnnotations.length === 0) {
      return { data: [] }
    }

    const annotationsToDelete = nonTagAnnotations.filter(annotation => annotation.isVisible)
    if (annotationsToDelete.length === 0) {
      return { data: [] }
    }

    return dispatch('deleteStageAnnotations', annotationsToDelete)
  }

export default deleteAllVisibleStageAnnotations
