import { Editor } from '@/engine/editor'
import { Action } from '@/engine/managers'
import { Annotation, AnnotationData } from '@/engine/models'
import { isVideoAnnotationData, isVideoSubAnnotations } from '@/engine/models/annotation/Annotation'

export const deleteKeyframeAction = (
  editor: Editor,
  annotation: Annotation,
  key: number
): Action => {
  const previousData = annotation.data
  return {
    async do (): Promise<boolean> {
      if (!isVideoAnnotationData(annotation.data)) { return false }
      if (!isVideoSubAnnotations(annotation.subAnnotations)) { return false }

      const keyString = key.toString()
      const otherFrameKeys = Object.keys(annotation.data.frames)
        .filter(k => k !== keyString)
      const otherSubFrameKeys = Object.keys(annotation.data.sub_frames)
        .filter(k => k !== keyString)
      const subVideoAnnotations = annotation.subAnnotations
      const annotationSubFrameKeys = Object.keys(subVideoAnnotations.frames)
        .filter(k => k !== keyString)

      const frames: { [frame: string]: AnnotationData } = {}
      const subFrames: { [frame: string]: AnnotationData } = {}
      const subAnnotationFrames: { [frame: string]: AnnotationData } = {}
      for (const k of otherFrameKeys) {
        frames[k] = annotation.data.frames[k]
      }
      for (const k of otherSubFrameKeys) {
        subFrames[k] = annotation.data.sub_frames[k]
      }
      for (const k of annotationSubFrameKeys) {
        subAnnotationFrames[k] = subVideoAnnotations.frames[k]
      }
      await editor
        .activeView
        .annotationManager
        .persistUpdateAnnotation(
          annotation.shallowClone({
            data: { ...annotation.data, frames, sub_frames: subFrames },
            subAnnotations: { frames: subAnnotationFrames } as unknown as Annotation[]
          })
        )
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
