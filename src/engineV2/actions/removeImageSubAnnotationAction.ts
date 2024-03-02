import { Action } from '@/engineV2/managers/actionManager'
import { Annotation, isVideoSubAnnotations } from '@/engineV2/models'
import { View } from '@/engineV2/views'
import { AnnotationTypeName } from '@/store/types'

import { addSubAnnotation, removeSubAnnotation } from './utils'

/**
 * Remove Image SubAnnotation by annotation type
 */
export const removeImageSubAnnotationAction =
  (view: View, type: AnnotationTypeName, parent: Annotation): Action => {
    let subAnnotation: Annotation | undefined

    return {
      do (): boolean {
        if (isVideoSubAnnotations(parent.subAnnotations)) { return false }

        const subAnnotations = parent.subAnnotations
        subAnnotation = subAnnotations.find(elem => elem.type === type)
        if (!subAnnotation) { return false }

        removeSubAnnotation(subAnnotation, parent)
        view.annotationManager.updateAnnotation(parent)
        return true
      },
      undo (): boolean {
        if (isVideoSubAnnotations(parent.subAnnotations) || !subAnnotation) { return false }
        addSubAnnotation(view, subAnnotation, parent)
        view.annotationManager.updateAnnotation(parent)
        return true
      }
    }
  }
