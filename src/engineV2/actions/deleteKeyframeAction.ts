import { Action } from '@/engineV2/managers'
import { Annotation, AnnotationData } from '@/engineV2/models'
import {
  isVideoAnnotationData,
  isVideoSubAnnotations
} from '@/engineV2/models/annotation/Annotation'
import { View } from '@/engineV2/views'

export const deleteKeyframeAction = (
  view: View,
  annotation: Annotation,
  key: number
): Action => {
  const previousData = annotation.data
  return {
    do (): boolean {
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
      view.annotationManager.updateAnnotation(
        annotation.shallowClone({
          data: { ...annotation.data, frames, sub_frames: subFrames },
          subAnnotations: { frames: subAnnotationFrames } as unknown as Annotation[]
        })
      )
      return true
    },
    undo (): boolean {
      annotation.data = previousData
      view.annotationManager.updateAnnotation(annotation)
      return true
    }
  }
}
