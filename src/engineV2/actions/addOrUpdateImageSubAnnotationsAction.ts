import { Action } from '@/engineV2/managers'
import { Annotation, ImageSubAnnotation, isVideoSubAnnotations } from '@/engineV2/models'
import { View } from '@/engineV2/views'

import { addSubAnnotation, removeSubAnnotation } from './utils'

export function addOrUpdateImageSubAnnotationsAction (
  view: View,
  subAnnotations: ImageSubAnnotation[],
  parent: Annotation
): Action {
  let previousSubAnnotations: Annotation[] = []
  return {
    do (): boolean {
      if (isVideoSubAnnotations(parent.subAnnotations)) { return false }
      for (const annotation of subAnnotations) {
        const previousSubAnnotation = (parent.subAnnotations as ImageSubAnnotation[])
          .find(ann => ann.type === annotation.type && ann.parentId === parent!.id)
        if (previousSubAnnotation) {
          previousSubAnnotations.push(previousSubAnnotation)
          removeSubAnnotation(previousSubAnnotation, parent)
        }
        addSubAnnotation(view, annotation, parent)
      }
      view.annotationManager.updateAnnotation(parent)
      return true
    },
    undo (): boolean {
      if (isVideoSubAnnotations(parent.subAnnotations)) { return false }
      parent.subAnnotations = []
      for (const annotation of previousSubAnnotations) {
        addSubAnnotation(view, annotation, parent)
      }
      previousSubAnnotations = []
      view.annotationManager.updateAnnotation(parent)
      return true
    }
  }
}
