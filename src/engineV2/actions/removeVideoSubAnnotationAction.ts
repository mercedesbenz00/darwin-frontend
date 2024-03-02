import { Action } from '@/engineV2/managers'
import {
  Annotation,
  isVideoSubAnnotations,
  VideoAnnotation
} from '@/engineV2/models'
import { View } from '@/engineV2/views'
import { AnnotationTypeName } from '@/store/types'

/**
 * Remove Video SubAnnotation by annotation type
 */
export function removeVideoSubAnnotationAction (
  view: View,
  type: AnnotationTypeName,
  parent: VideoAnnotation
): Action {
  if (!isVideoSubAnnotations(parent.subAnnotations)) {
    throw new Error('Expected to be video annotation')
  }

  return {
    do () {
      if (view.isLoading) { throw new Error('Expected editor to have loaded video') }

      const frameIndex = view.currentFrameIndex

      const res = view.annotationManager.getVideoSubAnnotationData(parent)
      let updatedAnnotation: Annotation

      if (res?.subkeyframe) {
        updatedAnnotation = parent.shallowClone()
      } else {
        const data = view.annotationManager.inferVideoSubAnnotationDataOnly(parent.data)

        updatedAnnotation = parent.shallowClone({
          data: {
            ...parent.data,
            sub_frames: {
              ...parent.data.sub_frames,
              [frameIndex]: data
            }
          }
        })
      }
      if (!isVideoSubAnnotations(updatedAnnotation.subAnnotations)) { return false }
      const inferredSubAnnotations = view.annotationManager.inferVideoSubAnnotations(parent)
      updatedAnnotation.subAnnotations.frames[frameIndex] =
        inferredSubAnnotations.filter((ann) => ann.type !== type)

      view.annotationManager.updateAnnotation(updatedAnnotation)
      return true
    },
    undo () {
      view.annotationManager.updateAnnotation(parent)
      return true
    }
  }
}
