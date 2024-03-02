import { Editor } from '@/engine/editor'
import { Action } from '@/engine/managers'
import {
  Annotation,
  ImageSubAnnotation,
  isVideoSubAnnotations,
  VideoAnnotation
} from '@/engine/models'

export function addOrUpdateVideoSubAnnotationsAction (
  editor: Editor,
  subAnnotations: ImageSubAnnotation[],
  parent: VideoAnnotation
): Action {
  if (!isVideoSubAnnotations(parent.subAnnotations)) {
    throw new Error('Expected to be video annotation')
  }

  return {
    async do (): Promise<boolean> {
      if (!editor.loadedVideo) { throw new Error('Expected editor to have loaded video') }
      const { activeView } = editor
      const frameIndex = activeView.currentFrameIndex

      const { data, keyframe, subs } = parent.inferVideoData(activeView)
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
