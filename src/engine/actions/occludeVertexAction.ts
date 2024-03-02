import { Editor } from '@/engine/editor'
import { Action } from '@/engine/managers'
import { Annotation } from '@/engine/models'
import { EditableImagePoint } from '@/engineCommon/point'

import { updateNodes } from './updateNodes'
import { updateImageAnnotation, updateVideoAnnotation } from './utils'

/**
 * Occlude a vertex from the skeleton annotation at the specified index.
 *
 * The path must be a reference in order for update to work correctly.
 *
 * @param {Editor} editor Editor instance
 * @param {Annotation} annotation Annotation whose path we're occluding a vertex from
 * @param {EditableImagePoint[]} path Reference to the annotation path
 * @param {number} index The index of the vertex to occlude
 */
export const occludeVertexAction = (
  editor: Editor,
  annotation: Annotation,
  path: EditableImagePoint[],
  index: number
): Action => {
  const updatedAnnotation = annotation.isVideoAnnotation()
    ? updateVideoAnnotation(editor, annotation, updateNodes, index)
    : updateImageAnnotation(editor, annotation, updateNodes, index)

  return {
    async do (): Promise<boolean> {
      await editor
        .activeView
        .annotationManager
        .persistUpdateAnnotation(updatedAnnotation)
      return true
    },
    async undo (): Promise<boolean> {
      await editor
        .activeView
        .annotationManager
        .persistUpdateAnnotation(annotation)
      return true
    }
  }
}
