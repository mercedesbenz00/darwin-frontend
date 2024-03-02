import { Editor } from '@/engine/editor'
import { Action } from '@/engine/managers'
import { Annotation, AnnotationData } from '@/engine/models'

// Updates the annotation data inside an action.
export function updateAnnotationData (
  editor: Editor,
  annotation: Annotation,
  oldData: AnnotationData,
  newData: AnnotationData
): Action {
  return {
    async do (): Promise<boolean> {
      annotation.centroid = undefined
      await editor
        .activeView
        .annotationManager
        .persistUpdateAnnotation(annotation.shallowClone({ data: newData }))
      return true
    },

    async undo (): Promise<boolean> {
      annotation.centroid = undefined
      await editor
        .activeView
        .annotationManager
        .persistUpdateAnnotation(annotation.shallowClone({ data: oldData }))
      return true
    }
  }
}
