import { Action } from '@/engineV2/managers'
import { Annotation } from '@/engineV2/models'
import { View } from '@/engineV2/views'

import { restoreJoints } from './restoreJoints'
import { updateImageAnnotation, updateVideoAnnotation } from './utils'

/**
 * Restore all joints from the skeleton annotation.
 *
 * @param {Editor} editor Editor instance
 * @param {Annotation} annotation Annotation whose nodes we are un-occluding
 */
export const restoreAllJointsAction = (view: View, annotation: Annotation): Action => {
  const updatedAnnotation = annotation.isVideoAnnotation()
    ? updateVideoAnnotation(view, annotation, restoreJoints)
    : updateImageAnnotation(annotation, restoreJoints)

  return {
    do () {
      view.annotationManager.updateAnnotation(updatedAnnotation)
      return true
    },
    undo () {
      view.annotationManager.updateAnnotation(annotation)
      return true
    }
  }
}
