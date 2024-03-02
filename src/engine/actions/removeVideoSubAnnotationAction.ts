import { Editor } from '@/engine/editor'
import { Action } from '@/engine/managers'
import {
  Annotation,
  isVideoSubAnnotations,
  VideoAnnotation
} from '@/engine/models'
import { AnnotationTypeName } from '@/store/types'

/**
 * Remove Video SubAnnotation by annotation type
 */
export function removeVideoSubAnnotationAction (
  editor: Editor,
  type: AnnotationTypeName,
  parent: VideoAnnotation
): Action {
  if (!isVideoSubAnnotations(parent.subAnnotations)) {
    throw new Error('Expected to be video annotation')
  }

  return {
    async do (): Promise<boolean> {
      if (!(editor.activeView.loadedVideo)) {
        throw new Error('Expected editor to have loaded video')
      }
      const frameIndex = editor.activeView.currentFrameIndex

      const res = editor.getVideoSubAnnotationData(parent)
      let updatedAnnotation: Annotation

      if (res?.subkeyframe) {
        updatedAnnotation = parent.shallowClone()
      } else {
        const data = editor.inferVideoSubAnnotationDataOnly(parent.data)

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
      const inferredSubAnnotations = editor.inferVideoSubAnnotations(parent)
      updatedAnnotation.subAnnotations.frames[frameIndex] =
        inferredSubAnnotations.filter((ann) => ann.type !== type)

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
