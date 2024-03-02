import { Editor } from '@/engine/editor'
import { Action } from '@/engine/managers/actionManager'
import { Annotation } from '@/engine/models'

import { matchAnnotation } from './utils'

export function deleteAnnotationAction (editor: Editor, annotation: Annotation): Action {
  // need to store id to match by on undo/redo
  const { id } = annotation

  return {
    async do (): Promise<boolean> {
      const match = matchAnnotation(editor, id)
      if (!match) { return false }
      await editor
        .activeView
        .annotationManager
        .persistDeleteAnnotation(match)
      return true
    },

    async undo (): Promise<boolean> {
      await editor
        .activeView
        .annotationManager
        .persistCreateAnnotation(annotation)
      return true
    }
  }
}
