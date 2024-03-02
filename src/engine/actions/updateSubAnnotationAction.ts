import { Editor } from '@/engine/editor'
import { Action } from '@/engine/managers'
import { Annotation } from '@/engine/models'

import { addSubAnnotation, removeSubAnnotation } from './utils'

export function updateSubAnnotationAction (
  editor: Editor,
  annotation: Annotation,
  parent: Annotation,
  existingAnnotation: Annotation
): Action {
  return {
    async do (): Promise<boolean> {
      removeSubAnnotation(existingAnnotation, parent)
      addSubAnnotation(editor, annotation, parent)
      await editor
        .activeView
        .annotationManager
        .persistUpdateAnnotation(parent)
      return true
    },
    async undo (): Promise<boolean> {
      removeSubAnnotation(annotation, parent)
      addSubAnnotation(editor, existingAnnotation, parent)
      await editor
        .activeView
        .annotationManager
        .persistUpdateAnnotation(parent)
      return true
    }
  }
}
