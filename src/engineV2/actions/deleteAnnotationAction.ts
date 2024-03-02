import { Action } from '@/engineV2/managers'
import { Annotation } from '@/engineV2/models'
import { View } from '@/engineV2/views'

import { matchAnnotation } from './utils'

export function deleteAnnotationAction (view: View, annotation: Annotation): Action {
  // need to store id to match by on undo/redo
  const { id } = annotation

  return {
    do (): boolean {
      const match = matchAnnotation(view, id)
      if (!match) { return false }
      view
        .annotationManager
        .deleteAnnotation(match)
      return true
    },

    undo (): boolean {
      view
        .annotationManager
        .createAnnotation(annotation)
      return true
    }
  }
}
