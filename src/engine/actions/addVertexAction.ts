import { Editor } from '@/engine/editor'
import { Action } from '@/engine/managers'
import { Annotation } from '@/engine/models'
import { EditableImagePoint } from '@/engineCommon/point'
/**
 * Add a vertex to the annotation path at the specified index.
 *
 * The path must be a reference in order for update to work correctly.
 *
 * @param {Editor} editor Editor instance
 * @param {Annotation} annotation Annotation who's path we're removing a vertex from
 * @param {EditableImagePoint[]} path Reference to the annotation path
 * @param {number} index The position to insert the new vertex at
 * @param {EditableImagePoint} vertext The vertex to insert
 */
export const addVertexAction = (
  editor: Editor,
  annotation: Annotation,
  path: EditableImagePoint[],
  index: number,
  vertex: EditableImagePoint
): Action => {
  return {
    async do (): Promise<boolean> {
      // add the new 'vertex' at 'index' position
      // NB: splice directly modify the passed path
      path.splice(index, 0, vertex)
      // un-highlight the centroid as the new vertex will be highlighted next
      annotation.centroid = undefined
      // save the updated annotation to the BE
      if (annotation.isVideoAnnotation()) {
        const { data } = annotation.inferVideoData(editor.activeView)
        await editor
          .activeView
          .annotationManager
          .persistUpdateAnnotation(annotation.shallowClone({
            data: {
              ...annotation.data,
              frames: {
                ...annotation.data.frames,
                [editor.activeView.currentFrameIndex]: data
              }
            }
          }))
      } else {
        await editor
          .activeView
          .annotationManager
          .persistUpdateAnnotation(annotation)
      }
      return true
    },
    async undo (): Promise<boolean> {
      // remove the vertex at 'index' position
      // NB: splice directly modify the passed path
      path.splice(index, 1)
      // un-highlight the centroid as the new vertex will be highlighted next
      annotation.centroid = undefined
      // save the updated annotation to the BE
      await editor
        .activeView
        .annotationManager
        .persistUpdateAnnotation(annotation)
      return true
    }
  }
}
