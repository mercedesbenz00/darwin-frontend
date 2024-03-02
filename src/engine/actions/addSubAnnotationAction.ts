import { Editor } from '@/engine/editor'
import { Action } from '@/engine/managers'
import { Annotation } from '@/engine/models'

import { addSubAnnotation, removeSubAnnotation } from './utils'

export function addSubAnnotationAction (
  editor: Editor,
  annotation: Annotation,
  parent: Annotation
): Action {
  return {
    async do (): Promise<boolean> {
      addSubAnnotation(editor, annotation, parent)
      await editor
        .activeView
        .annotationManager
        .persistUpdateAnnotation(parent)
      return true
    },
    async undo (): Promise<boolean> {
      removeSubAnnotation(annotation, parent)
      await editor
        .activeView
        .annotationManager
        .persistUpdateAnnotation(parent)
      return true
    }
  }
}
