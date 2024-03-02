import { Editor } from '@/engine/editor'
import { Action } from '@/engine/managers/actionManager'
import { Annotation, isVideoAnnotation } from '@/engine/models'
import { AnnotationTypeName } from '@/store/types'

import { removeImageSubAnnotationAction } from './removeImageSubAnnotationAction'
import { removeVideoSubAnnotationAction } from './removeVideoSubAnnotationAction'

/**
 * Remove Image/Video SubAnnotation by annotation type
 */
export function removeSubAnnotationAction (
  editor: Editor,
  type: AnnotationTypeName,
  parent: Annotation
): Action {
  return isVideoAnnotation(parent)
    ? removeVideoSubAnnotationAction(editor, type, parent)
    : removeImageSubAnnotationAction(editor, type, parent)
}
