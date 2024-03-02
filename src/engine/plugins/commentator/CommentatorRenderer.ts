import { drawPath, calcCentroid } from '@/engine/graphics'
import { CommentThread, CompoundPath, MainAnnotationTypeRenderer, View } from '@/engine/models'
import { COMMENT_THREAD_BOUNDING_BOX_COLOR, CommentVertices } from '@/engineCommon/comment'
import { ImageManipulationFilter } from '@/engineCommon/imageManipulation'
import { EditableImagePoint, EditablePoint, ImagePoint } from '@/engineCommon/point'

const ICON_WIDTH = 25
const ICON_HEIGHT = 25

const getPath = (commentThread: CommentThread): EditableImagePoint[] => {
  const commentBox = commentThread.annotationBoundingBox

  if (!commentBox) {
    throw new Error('Attempted to getPath for a comment thread without a bounding box')
  }

  return [commentBox.topLeft, commentBox.topRight, commentBox.bottomRight, commentBox.bottomLeft]
}

const getCentroidRectPath =
  (commentThread: CommentThread, width: number, height: number): EditableImagePoint[] => {
    const commentBox = commentThread.annotationBoundingBox as CommentVertices | undefined
    if (!commentBox) {
      throw new Error(
        'Attempted to getCentroidRectPath for a comment thread without a bounding box'
      )
    }

    const centroid = calcCentroid(
      [commentBox.topLeft, commentBox.topRight, commentBox.bottomRight, commentBox.bottomLeft]
    )

    const cTopLeft: EditableImagePoint =
      new EditablePoint({x: centroid.x - width / 2, y: centroid.y - height / 2 })

    const cTopRight: EditableImagePoint =
      new EditablePoint({ x: centroid.x + width / 2, y: centroid.y - height / 2 })

    const cBottomRight: EditableImagePoint =
      new EditablePoint({ x: centroid.x + width / 2, y: centroid.y + height / 2 })

    const cBottomLeft: EditableImagePoint =
      new EditablePoint({ x: centroid.x - width / 2, y: centroid.y + height / 2 })

    return [cTopLeft, cTopRight, cBottomRight, cBottomLeft]
  }

export class CommentatorRenderer extends MainAnnotationTypeRenderer {
  readonly supportsCentroidRectPath: boolean = true
  render (
    view: View,
    commentThread: CommentThread,
    inferred: boolean,
    filter: ImageManipulationFilter | null
  ): void {
    const shouldRender = commentThread.isSelected || commentThread.isHighlighted
    if (!shouldRender) { return }

    const path = this.getPath(commentThread)
    const color = COMMENT_THREAD_BOUNDING_BOX_COLOR
    drawPath(
      view,
      path,
      color,
      inferred,
      filter,
      commentThread.isHighlighted,
      commentThread.isSelected && commentThread.isEditable
    )
  }

  getPath (commentThread: CommentThread): CompoundPath {
    return { path: getPath(commentThread), additionalPaths: [] }
  }

  getAllVertices (commentThread: CommentThread): EditableImagePoint[] {
    return getPath(commentThread)
  }

  getCentroidRectPath (commentThread: CommentThread): EditableImagePoint[] | undefined {
    return getCentroidRectPath(commentThread, ICON_WIDTH, ICON_HEIGHT)
  }

  translate (commentThread: CommentThread, offset: ImagePoint): void {
    getPath(commentThread).map(point => point.add_(offset))
  }

  moveVertex (
    commentThread: CommentThread,
    movingVertex: EditableImagePoint,
    offset: ImagePoint
  ): void {
    const path = getPath(commentThread)
    let index: number | undefined
    for (let i = 0; i < path.length; i++) {
      if (path[i].x === movingVertex.x && path[i].y === movingVertex.y) {
        index = i
        break
      }
    }

    switch (index) {
    // Top Left -> Top Right and Bottom Left move
    case 0: {
      path[0].add_(offset)
      path[1].y += offset.y
      path[3].x += offset.x
      break
    }
    // Top Right -> Top Left and Bottom Right move
    case 1: {
      path[1].add_(offset)
      path[0].y += offset.y
      path[2].x += offset.x
      break
    }
    // Bottom Right -> Top Right and Bottom Left move
    case 2: {
      path[2].add_(offset)
      path[1].x += offset.x
      path[3].y += offset.y
      break
    }
    // Bottom Left -> Top Left and Bottom Right move
    case 3: {
      path[3].add_(offset)
      path[0].x += offset.x
      path[2].y += offset.y
      break
    }
    }
  }
}
