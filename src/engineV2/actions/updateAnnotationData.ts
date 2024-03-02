import { Action } from '@/engineV2/managers'
import { Annotation, AnnotationData } from '@/engineV2/models'
import { View } from '@/engineV2/views'

// Updates the annotation data inside an action.
export function updateAnnotationData (
  view: View,
  annotation: Annotation,
  oldData: AnnotationData,
  newData: AnnotationData
): Action {
  return {
    do (): boolean {
      annotation.centroid = undefined
      view
        .annotationManager
        .updateAnnotation(
          annotation.shallowClone({ data: newData })
        )
      return true
    },

    undo (): boolean {
      annotation.centroid = undefined
      view
        .annotationManager
        .updateAnnotation(
          annotation.shallowClone({ data: oldData })
        )
      return true
    }
  }
}
