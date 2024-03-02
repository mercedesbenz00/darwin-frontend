import { Action } from '@/engineV2/managers'
import { Annotation, isVideoSubAnnotations } from '@/engineV2/models'
import { View } from '@/engineV2/views'

export function updateSubAnnotationKeyframeAction (
  view: View,
  keyframeSubAnnotation: Annotation,
  parent: Annotation
): Action {
  if (!parent.isVideoAnnotation()) { throw new Error('Expected video annotation') }
  if (view.isLoading) { throw new Error('Expected video to be loaded') }

  const currentIndex = view.currentFrameIndex
  return {
    do (): boolean {
      const updatedAnnotation = parent.shallowClone({
        data: {
          ...parent.data,
          sub_frames: {
            ...parent.data.sub_frames
          }
        }
      })
      if (!isVideoSubAnnotations(updatedAnnotation.subAnnotations)) { return false }

      const existingSubAnnotations = currentIndex in updatedAnnotation.subAnnotations.frames
        ? updatedAnnotation.subAnnotations.frames[currentIndex]
        : view.annotationManager.inferVideoSubAnnotations(parent)
      const frameSubAnnotations = existingSubAnnotations.filter(
        ann => ann.id !== keyframeSubAnnotation.id
      )
      frameSubAnnotations.push(keyframeSubAnnotation)
      updatedAnnotation.subAnnotations.frames[currentIndex] = frameSubAnnotations

      view.annotationManager.updateAnnotation(updatedAnnotation)
      return true
    },
    undo (): boolean {
      view.annotationManager.updateAnnotation(parent)
      return true
    }
  }
}
