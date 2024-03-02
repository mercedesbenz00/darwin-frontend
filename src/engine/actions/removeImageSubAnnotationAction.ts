import { Editor } from '@/engine/editor'
import { Action } from '@/engine/managers/actionManager'
import { Annotation, isVideoSubAnnotations } from '@/engine/models'
import { AnnotationTypeName } from '@/store/types'

import { addSubAnnotation, removeSubAnnotation } from './utils'

/**
 * Remove Image SubAnnotation by annotation type
 */
export function removeImageSubAnnotationAction (
  editor: Editor,
  type: AnnotationTypeName,
  parent: Annotation
): Action {
  let subAnnotation: Annotation | undefined

  return {
    async do (): Promise<boolean> {
      if (isVideoSubAnnotations(parent.subAnnotations)) { return false }

      const subAnnotations = parent.subAnnotations
      subAnnotation = subAnnotations.find(elem => elem.type === type)
      if (!subAnnotation) { return false }

      removeSubAnnotation(subAnnotation, parent)
      await editor
        .activeView
        .annotationManager
        .persistUpdateAnnotation(parent)
      return true
    },
    async undo (): Promise<boolean> {
      if (isVideoSubAnnotations(parent.subAnnotations) || !subAnnotation) { return false }
      addSubAnnotation(editor, subAnnotation, parent)
      await editor
        .activeView
        .annotationManager
        .persistUpdateAnnotation(parent)
      return true
    }
  }
}
