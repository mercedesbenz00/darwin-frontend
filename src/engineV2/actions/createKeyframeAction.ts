import { Action } from '@/engineV2/managers'
import { Annotation } from '@/engineV2/models'
import { View } from '@/engineV2/views'

export const createKeyframeAction = (
  view: View,
  annotation: Annotation,
  frameIndex: number
): Action => {
  const previousData = annotation.data
  return {
    do () {
      if (!annotation.isVideoAnnotation()) { return false }

      const { data } = annotation.inferVideoData(view)
      const updatedAnnotation = annotation.shallowClone({
        data: { ...annotation.data, frames: { ...annotation.data.frames, [frameIndex]: data } }
      })

      view.annotationManager.updateAnnotation(updatedAnnotation)
      return true
    },
    undo () {
      annotation.data = previousData
      view.annotationManager.updateAnnotation(annotation)
      return true
    }
  }
}
