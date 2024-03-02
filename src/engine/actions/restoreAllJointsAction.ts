import { Editor } from '@/engine/editor'
import { Action } from '@/engine/managers'
import { Annotation } from '@/engine/models'

import { restoreJoints } from './restoreJoints'
import { updateImageAnnotation, updateVideoAnnotation } from './utils'

/**
 * Restore all joints from the skeleton annotation.
 *
 * @param {Editor} editor Editor instance
 * @param {Annotation} annotation Annotation whose nodes we are un-occluding
 */
export const restoreAllJointsAction = (editor: Editor, annotation: Annotation): Action => {
  const updatedAnnotation = annotation.isVideoAnnotation()
    ? updateVideoAnnotation(editor, annotation, restoreJoints)
    : updateImageAnnotation(editor, annotation, restoreJoints)

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
