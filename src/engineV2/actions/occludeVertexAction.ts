import { EditableImagePoint } from '@/engineCommon/point'
import { Action } from '@/engineV2/managers'
import { Annotation } from '@/engineV2/models/annotation'
import { View } from '@/engineV2/views'

import { updateNodes } from './updateNodes'
import { updateImageAnnotation, updateVideoAnnotation } from './utils'

/**
 * Occlude a vertex from the skeleton annotation at the specified index.
 *
 * The path must be a reference in order for update to work correctly.
 *
 * @param {View} view instance
 * @param {Annotation} annotation Annotation whose path we're occluding a vertex from
 * @param {EditableImagePoint[]} path Reference to the annotation path
 * @param {number} index The index of the vertex to occlude
 */
export const occludeVertexAction = (
  view: View,
  annotation: Annotation,
  path: EditableImagePoint[],
  index: number
): Action => {
  const updatedAnnotation = annotation.isVideoAnnotation()
    ? updateVideoAnnotation(view, annotation, updateNodes, index)
    : updateImageAnnotation(annotation, updateNodes, index)

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
