import { Action } from '@/engineV2/managers'
import { Annotation } from '@/engineV2/models'
import { View } from '@/engineV2/views'

import { matchAnnotation } from './utils'

export function addAnnotationsAction (view: View, annotations: Annotation[]): Action {
  // need to store ids to match by on undo/redo
  const ids = annotations.map(a => a.id)

  return {
    do (): boolean {
      // We need to deselect all the annotations
      // because the new annotation will always be selected by default.
      view.annotationManager.deselectAllAnnotations()
      for (let i = 0; i < annotations.length; i++) {
        const annotation = annotations[i]
        let newAnnotation
        try {
          newAnnotation = view
            .annotationManager
            .createAnnotation(annotation)
        } catch (e: unknown) {
          console.error(e)
          return false
        }
        if (newAnnotation) { ids[i] = newAnnotation.id }
      }
      return true
    },

    undo (): boolean {
      for (const id of ids) {
        const matched = matchAnnotation(view, id)
        if (!matched) { continue }
        view
          .annotationManager
          .deleteAnnotation(matched)
      }
      return true
    }
  }
}
