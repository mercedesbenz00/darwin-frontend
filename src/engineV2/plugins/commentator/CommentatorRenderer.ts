import { COMMENT_THREAD_BOUNDING_BOX_COLOR } from '@/engineCommon/comment'
import { ImageManipulationFilter } from '@/engineCommon/imageManipulation'
import { EditableImagePoint, EditablePoint } from '@/engineCommon/point'
import { EditorCommentThread } from '@/engineV2/commentHelpers'
import { drawPath, calcCentroid } from '@/engineV2/graphics'
import { CompoundPath, MainAnnotationTypeRenderer, View } from '@/engineV2/models'
import { DrawCallback } from '@/engineV2/models/layers'
import { ILayer } from '@/engineV2/models/layers/types'

const ICON_WIDTH = 25
const ICON_HEIGHT = 25

const getPath = (thread: EditorCommentThread): EditableImagePoint[] => {
  return [thread.topLeft, thread.topRight, thread.bottomRight, thread.bottomLeft]
}

const getCentroidRectPath =
  (thread: EditorCommentThread, width: number, height: number): EditableImagePoint[] => {
    const centroid = calcCentroid([
      thread.topLeft,
      thread.topRight,
      thread.bottomRight,
      thread.bottomLeft
    ])
    const cTopLeft =
      new EditablePoint<'Image'>({ x: centroid.x - width / 2, y: centroid.y - height / 2 })
    const cTopRight =
      new EditablePoint<'Image'>({ x: centroid.x + width / 2, y: centroid.y - height / 2 })
    const cBottomRight =
      new EditablePoint<'Image'>({ x: centroid.x + width / 2, y: centroid.y + height / 2 })
    const cBottomLeft =
      new EditablePoint<'Image'>({ x: centroid.x - width / 2, y: centroid.y + height / 2 })

    return [cTopLeft, cTopRight, cBottomRight, cBottomLeft]
  }

export class CommentatorRenderer extends MainAnnotationTypeRenderer {
  readonly supportsCentroidRectPath: boolean = true
  render (
    drawFn: DrawCallback,
    view: View,
    layer: ILayer,
    thread: EditorCommentThread,
    inferred: boolean,
    filter: ImageManipulationFilter | null
  ): void {
    const isSelected = view.commentManager.selectedCommentThread?.id === thread.id
    const isHighlighted = view.commentManager.highlightedCommentThread?.id === thread.id

    const isEditable = thread.authorId === view.commentManager.currentUserId && !thread.conflict

    const shouldRender = isHighlighted || isSelected
    if (!shouldRender) { return }

    const path = this.getPath(thread)
    const color = COMMENT_THREAD_BOUNDING_BOX_COLOR

    drawPath(
      path,
      layer.context,
      view.camera,
      color,
      inferred,
      filter,
      isHighlighted,
      isSelected && isEditable
    )
  }

  getPath (thread: EditorCommentThread): CompoundPath {
    return {
      path: getPath(thread),
      additionalPaths: []
    }
  }

  getAllVertices (thread: EditorCommentThread): EditableImagePoint[] {
    return getPath(thread)
  }

  getCentroidRectPath (thread: EditorCommentThread): EditableImagePoint[] {
    return getCentroidRectPath(thread, ICON_WIDTH, ICON_HEIGHT)
  }

  /**
   * Just a  stub. In 2.0, CommentManager is handling this
   */
  translate (): void { throw new Error('Do not use this function') }
  /**
   * Just a  stub. In 2.0, CommentManager is handling this
   */
  moveVertex (): void { throw new Error('Do not use this function') }
}
