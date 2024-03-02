import { Editor } from '@/engine/editor'
import { Action } from '@/engine/managers'
import { Annotation } from '@/engine/models'

export const createKeyframeAction = (
  editor: Editor,
  annotation: Annotation,
  frameIndex: number
): Action => {
  const previousData = annotation.data
  return {
    async do (): Promise<boolean> {
      if (!annotation.isVideoAnnotation()) { return false }

      const { data } = annotation.inferVideoData(editor.activeView)
      const updatedAnnotation = annotation.shallowClone({
        data: { ...annotation.data, frames: { ...annotation.data.frames, [frameIndex]: data } }
      })

      await editor
        .activeView
        .annotationManager
        .persistUpdateAnnotation(updatedAnnotation)
      return true
    },
    async undo (): Promise<boolean> {
      annotation.data = previousData
      await editor
        .activeView
        .annotationManager
        .persistUpdateAnnotation(annotation)
      return true
    }
  }
}
