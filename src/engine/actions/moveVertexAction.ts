import { Editor } from '@/engine/editor'
import { Action } from '@/engine/managers'
import { Annotation } from '@/engine/models'
import { IView } from '@/engine/models/views/types'
import { EditableImagePoint, ImagePoint } from '@/engineCommon/point'
export function moveVertexAction (
  editor: Editor,
  originAnnotation: Annotation | undefined,
  annotation: Annotation,
  vertex: EditableImagePoint,
  startPosition: ImagePoint,
  endPosition: ImagePoint,
  move: (
    annotation: Annotation,
    vertex: EditableImagePoint,
    offset: ImagePoint,
    view: IView
  ) => void
): Action {
  return {
    async do (): Promise<boolean> {
      move(annotation, vertex, endPosition.sub(startPosition), editor.activeView)
      annotation.centroid = undefined

      let updatedAnnotation: Annotation = annotation.shallowClone()

      if (editor.activeView.loadedVideo) {
        const { activeView } = editor

        const { data, keyframe } = annotation.inferVideoData(editor.activeView)

        if (!keyframe && originAnnotation) {
          updatedAnnotation = annotation.shallowClone({
            data: {
              ...originAnnotation.data,
              frames: {
                ...originAnnotation.data.frames,
                [activeView.currentFrameIndex]: data
              }
            }
          })
        }
      }

      await editor
        .activeView
        .annotationManager
        .persistUpdateAnnotation(updatedAnnotation)
      return true
    },
    async undo (): Promise<boolean> {
      move(annotation, vertex, startPosition.sub(endPosition), editor.activeView)
      annotation.centroid = undefined
      await editor
        .activeView
        .annotationManager
        .persistUpdateAnnotation(annotation)
      return true
    }
  }
}
