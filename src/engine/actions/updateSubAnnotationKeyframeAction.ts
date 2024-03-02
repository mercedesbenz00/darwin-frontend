import { Editor } from '@/engine/editor'
import { Action } from '@/engine/managers'
import { Annotation, isVideoSubAnnotations } from '@/engine/models'

export function updateSubAnnotationKeyframeAction (
  editor: Editor,
  keyframeSubAnnotation: Annotation,
  parent: Annotation
): Action {
  if (!parent.isVideoAnnotation()) { throw new Error('Expected video annotation') }
  if (!(editor.activeView.loadedVideo)) { throw new Error('Expected video to be loaded') }

  const currentIndex = editor.activeView.currentFrameIndex
  return {
    async do (): Promise<boolean> {
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
        : editor.inferVideoSubAnnotations(parent)
      const frameSubAnnotations = existingSubAnnotations.filter(
        ann => ann.id !== keyframeSubAnnotation.id
      )
      frameSubAnnotations.push(keyframeSubAnnotation)
      updatedAnnotation.subAnnotations.frames[currentIndex] = frameSubAnnotations

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
        .persistUpdateAnnotation(parent)
      return true
    }
  }
}
