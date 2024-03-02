import { Editor } from '@/engine/editor'
import { Action } from '@/engine/managers'
import { Annotation } from '@/engine/models'

import { matchAnnotation } from './utils'

export function addAnnotationAction (editor: Editor, annotation: Annotation): Action {
  return {
    async do (): Promise<boolean> {
      // We need to deselect all the annotations
      // because the new annotation will always be selected by default.
      editor.deselectAllAnnotations()
      await editor
        .activeView
        .annotationManager
        .persistCreateAnnotation(annotation)
      return true
    },

    async undo (): Promise<boolean> {
      const matched = matchAnnotation(editor, annotation.id)
      if (!matched) { return false }
      await editor
        .activeView
        .annotationManager
        .persistDeleteAnnotation(matched)
      return true
    }
  }
}
