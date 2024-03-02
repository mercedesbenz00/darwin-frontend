import { Editor } from '@/engine/editor'
import { Action } from '@/engine/managers'
import { Annotation } from '@/engine/models'

import { matchAnnotation } from './utils'

export function addAnnotationsAction (editor: Editor, annotations: Annotation[]): Action {
  // need to store ids to match by on undo/redo
  const ids = annotations.map(a => a.id)

  return {
    async do (): Promise<boolean> {
      // We need to deselect all the annotations
      // because the new annotation will always be selected by default.
      editor.deselectAllAnnotations()
      for (let i = 0; i < annotations.length; i++) {
        const annotation = annotations[i]
        const newAnnotation = await editor
          .activeView
          .annotationManager
          .persistCreateAnnotation(annotation)
        if (newAnnotation) { ids[i] = newAnnotation.id }
      }
      return true
    },

    async undo (): Promise<boolean> {
      for (const id of ids) {
        const matched = matchAnnotation(editor, id)
        if (!matched) { continue }
        await editor
          .activeView
          .annotationManager
          .persistDeleteAnnotation(matched)
      }
      return true
    }
  }
}
