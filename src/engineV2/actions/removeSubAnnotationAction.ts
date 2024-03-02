import { Action } from '@/engineV2/managers/actionManager'
import { Annotation, isVideoAnnotation } from '@/engineV2/models'
import { View } from '@/engineV2/views'
import { AnnotationTypeName } from '@/store/types'

import { removeImageSubAnnotationAction } from './removeImageSubAnnotationAction'
import { removeVideoSubAnnotationAction } from './removeVideoSubAnnotationAction'

/**
 * Remove Image/Video SubAnnotation by annotation type
 */
export const removeSubAnnotationAction =
  (view: View, type: AnnotationTypeName, parent: Annotation): Action => {
    return isVideoAnnotation(parent)
      ? removeVideoSubAnnotationAction(view, type, parent)
      : removeImageSubAnnotationAction(view, type, parent)
  }
