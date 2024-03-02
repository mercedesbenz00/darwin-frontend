import { EditableImagePoint, ImagePoint } from '@/engineCommon/point'
import { Action } from '@/engineV2/managers'
import { Annotation } from '@/engineV2/models/annotation'
import { View } from '@/engineV2/views'

export function moveVertexAction (
  view: View,
  originAnnotation: Annotation | undefined,
  annotation: Annotation,
  vertex: EditableImagePoint,
  startPosition: ImagePoint,
  endPosition: ImagePoint,
  move: (
    annotation: Annotation,
    vertex: EditableImagePoint,
    offset: ImagePoint,
    view: View
  ) => void
): Action {
  return {
    do (): boolean {
      move(annotation, vertex, endPosition.sub(startPosition), view)
      annotation.centroid = undefined

      let updatedAnnotation: Annotation = annotation.shallowClone()

      if (view.fileManager.isProcessedAsVideo) {
        const { data, keyframe } = annotation.inferVideoData(view)

        if (!keyframe && originAnnotation) {
          updatedAnnotation = annotation.shallowClone({
            data: {
              ...originAnnotation.data,
              frames: {
                ...originAnnotation.data.frames,
                [view.currentFrameIndex]: data
              }
            }
          })
        }
      }

      view.annotationManager.updateAnnotation(updatedAnnotation)
      return true
    },
    undo (): boolean {
      move(annotation, vertex, startPosition.sub(endPosition), view)
      annotation.centroid = undefined
      view.annotationManager.updateAnnotation(annotation)
      return true
    }
  }
}
