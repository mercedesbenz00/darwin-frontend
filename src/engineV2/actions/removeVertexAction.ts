import { EditableImagePoint } from '@/engineCommon/point'
import { Action } from '@/engineV2/managers'
import { Annotation } from '@/engineV2/models/annotation'
import { View } from '@/engineV2/views'

/**
 * Remove a vertex from the annotation path at the specified index.
 *
 * The path must be a reference in order for update to work correctly.
 *
 * @param {View} View instance
 * @param {Annotation} annotation Annotation who's path we're removing a vertex from
 * @param {EditableImagePoint[]} path Reference to the annotation path
 * @param {number} index The index of the vertex to remove
 */
export const removeVertexAction = (
  view: View,
  annotation: Annotation,
  path: EditableImagePoint[],
  index: number
): Action => {
  const point = path[index]
  return {
    do () {
      path.splice(index, 1)
      annotation.centroid = undefined
      view.annotationManager.updateAnnotation(annotation)
      return true
    },
    undo () {
      path.splice(index, 0, point)
      annotation.centroid = undefined
      view.annotationManager.updateAnnotation(annotation)
      return true
    }
  }
}
