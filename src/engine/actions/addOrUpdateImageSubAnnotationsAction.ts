import { Editor } from '@/engine/editor'
import { Action } from '@/engine/managers'
import { Annotation, ImageSubAnnotation, isVideoSubAnnotations } from '@/engine/models'

import { addSubAnnotation, removeSubAnnotation } from './utils'

export function addOrUpdateImageSubAnnotationsAction (
  editor: Editor,
  subAnnotations: ImageSubAnnotation[],
  parent: Annotation
): Action {
  let previousSubAnnotations: Annotation[] = []
  return {
    async do (): Promise<boolean> {
      if (isVideoSubAnnotations(parent.subAnnotations)) { return false }
      for (const annotation of subAnnotations) {
        const previousSubAnnotation = (parent.subAnnotations as ImageSubAnnotation[])
          .find(ann => ann.type === annotation.type && ann.parentId === parent!.id)
        if (previousSubAnnotation) {
          previousSubAnnotations.push(previousSubAnnotation)
          removeSubAnnotation(previousSubAnnotation, parent)
        }
        addSubAnnotation(editor, annotation, parent)
      }
      await editor
        .activeView
        .annotationManager
        .persistUpdateAnnotation(parent)
      return true
    },
    async undo (): Promise<boolean> {
      if (isVideoSubAnnotations(parent.subAnnotations)) { return false }
      parent.subAnnotations = []
      for (const annotation of previousSubAnnotations) {
        addSubAnnotation(editor, annotation, parent)
      }
      previousSubAnnotations = []
      await editor
        .activeView
        .annotationManager
        .persistUpdateAnnotation(parent)
      return true
    }
  }
}
