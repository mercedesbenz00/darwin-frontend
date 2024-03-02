import { Editor } from '@/engine/editor'
import { Action } from '@/engine/managers'
import { Annotation } from '@/engine/models'
import { EditableImagePoint } from '@/engineCommon/point'
/**
 * Remove a vertex from the annotation path at the specified index.
 *
 * The path must be a reference in order for update to work correctly.
 *
 * @param {Editor} editor Editor instance
 * @param {Annotation} annotation Annotation who's path we're removing a vertex from
 * @param {EditableImagePoint[]} path Reference to the annotation path
 * @param {number} index The index of the vertex to remove
 */
export const removeVertexAction = (
  editor: Editor,
  annotation: Annotation,
  path: EditableImagePoint[],
  index: number
): Action => {
  const point = path[index]
  return {
    async do (): Promise<boolean> {
      path.splice(index, 1)
      annotation.centroid = undefined
      await editor
        .activeView
        .annotationManager
        .persistUpdateAnnotation(annotation)
      return true
    },
    async undo (): Promise<boolean> {
      path.splice(index, 0, point)
      annotation.centroid = undefined
      await editor
        .activeView
        .annotationManager
        .persistUpdateAnnotation(annotation)
      return true
    }
  }
}
