import { Action } from '@/engineV2/managers'
import {
  Annotation,
  ImageSubAnnotation,
  isVideoSubAnnotations,
  VideoAnnotation
} from '@/engineV2/models'
import { View } from '@/engineV2/views'

export function addOrUpdateVideoSubAnnotationsAction (
  view: View,
  subAnnotations: ImageSubAnnotation[],
  parent: VideoAnnotation
): Action {
  if (!isVideoSubAnnotations(parent.subAnnotations)) {
    throw new Error('Expected to be video annotation')
  }

  return {
    do () {
      if (view.isLoading) { throw new Error('Expected editor to have loaded video') }

      const frameIndex = view.currentFrameIndex

      const { data, keyframe, subs } = parent.inferVideoData(view)
      let updatedAnnotation: Annotation

      if (keyframe) {
        updatedAnnotation = parent.shallowClone()
      } else {
        updatedAnnotation = parent.shallowClone({
          data: {
            ...parent.data,
            frames: {
              ...parent.data.frames,
              [frameIndex]: data
            }
          }
        })
      }
      if (!isVideoSubAnnotations(updatedAnnotation.subAnnotations)) { return false }
      updatedAnnotation.subAnnotations.frames[frameIndex] = [...subs, ...subAnnotations]

      view.annotationManager.updateAnnotation(updatedAnnotation)
      return true
    },
    undo () {
      view.annotationManager.updateAnnotation(parent)
      return true
    }
  }
}
