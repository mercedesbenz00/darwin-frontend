import { Action } from '@/engineV2/managers'
import { FeatureFlagsManager } from '@/engineV2/managers/featureFlagsManager'
import { Annotation } from '@/engineV2/models'
import { View } from '@/engineV2/views'

import { matchAnnotation } from './utils'

export function addAnnotationAction (view: View, annotation: Annotation): Action {
  return {
    do (): boolean {
      // We need to deselect all the annotations
      // because the new annotation will always be selected by default.
      view
        .annotationManager
        .deselectAllAnnotations()
      if (FeatureFlagsManager.isOnLayerV2) {
        annotation.deselect()
        annotation.unhighlight()
      }
      try {
        view
          .annotationManager
          .createAnnotation(annotation)

        if (FeatureFlagsManager.isOnLayerV2) {
          view.annotationManager.selectAnnotation(annotation.id)
        }
      } catch (e: unknown) {
        console.error(e)
        return false
      }
      return true
    },

    undo (): boolean {
      const matched = matchAnnotation(view, annotation.id)
      if (!matched) { return false }
      view
        .annotationManager
        .deleteAnnotation(matched)
      if (FeatureFlagsManager.isOnLayerV2) {
        view.annotationsLayer.changedDebounce()
      }
      return true
    }
  }
}
