import { Action } from '@/engineV2/managers'
import { Annotation } from '@/engineV2/models'
import { View } from '@/engineV2/views'

import { addSubAnnotation, removeSubAnnotation } from './utils'

export const addSubAnnotationAction =
  (view: View, annotation: Annotation, parent: Annotation): Action => {
    return {
      do (): true {
        addSubAnnotation(view, annotation, parent)
        view.annotationManager.updateAnnotation(parent)
        return true
      },
      undo (): true {
        removeSubAnnotation(annotation, parent)
        view.annotationManager.updateAnnotation(parent)
        return true
      }
    }
  }
