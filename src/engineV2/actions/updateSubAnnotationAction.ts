import { Action } from '@/engineV2/managers'
import { Annotation } from '@/engineV2/models'
import { View } from '@/engineV2/views'

import { addSubAnnotation, removeSubAnnotation } from './utils'

export function updateSubAnnotationAction (
  view: View,
  annotation: Annotation,
  parent: Annotation,
  existingAnnotation: Annotation
): Action {
  return {
    do () {
      removeSubAnnotation(existingAnnotation, parent)
      addSubAnnotation(view, annotation, parent)
      view.annotationManager.updateAnnotation(parent)
      return true
    },
    undo () {
      removeSubAnnotation(annotation, parent)
      addSubAnnotation(view, existingAnnotation, parent)
      view.annotationManager.updateAnnotation(parent)
      return true
    }
  }
}
