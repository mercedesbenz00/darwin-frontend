import { EditableImagePoint } from '@/engineCommon/point'
import { Action } from '@/engineV2/managers'
import { Annotation } from '@/engineV2/models/annotation'
import { View } from '@/engineV2/views'

/**
 * Add a vertex to the annotation path at the specified index.
 *
 * The path must be a reference in order for update to work correctly.
 *
 * @param {view} view instance
 * @param {Annotation} annotation Annotation who's path we're removing a vertex from
 * @param {EditableImagePoint[]} path Reference to the annotation path
 * @param {number} index The position to insert the new vertex at
 * @param {EditableImagePoint} vertext The vertex to insert
 */
export const addVertexAction = (
  view: View,
  annotation: Annotation,
  path: EditableImagePoint[],
  index: number,
  vertex: EditableImagePoint
): Action => {
  return {
    do (): boolean {
      // add the new 'vertex' at 'index' position
      // NB: splice directly modify the passed path
      path.splice(index, 0, vertex)
      // un-highlight the centroid as the new vertex will be highlighted next
      annotation.centroid = undefined
      // save the updated annotation to the BE
      if (annotation.isVideoAnnotation()) {
        const { data } = annotation.inferVideoData(view)
        view.annotationManager.updateAnnotation(annotation.shallowClone({
          data: {
            ...annotation.data,
            frames: {
              ...annotation.data.frames,
              [view.currentFrameIndex]: data
            }
          }
        }))
      } else {
        view.annotationManager.updateAnnotation(annotation)
      }
      return true
    },
    undo (): boolean {
      // remove the vertex at 'index' position
      // NB: splice directly modify the passed path
      path.splice(index, 1)
      // un-highlight the centroid as the new vertex will be highlighted next
      annotation.centroid = undefined
      // save the updated annotation to the BE
      view.annotationManager.updateAnnotation(annotation)
      return true
    }
  }
}
