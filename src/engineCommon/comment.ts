import { RGBA } from '@/utils'

import { EditableImagePoint, EditablePoint } from './point'

/**
 * Defines the shape of the bounding box for a comment thread, as stored on the backend
 */
export interface CommentBoundingBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Defines the 4 editable vertices of a comment thread on canvas
 */
export type CommentVertices = {
  topLeft: EditableImagePoint;
  topRight: EditableImagePoint;
  bottomRight: EditableImagePoint;
  bottomLeft: EditableImagePoint;
}

export const COMMENT_THREAD_BOUNDING_BOX_COLOR: RGBA = { r: 255, g: 255, b: 255, a: 0.5 }

export const verticesToBoundingBox = (commentBox: CommentVertices): CommentBoundingBox => {
  const { x: left, y: top } = commentBox.topLeft
  const { x: right, y: bottom } = commentBox.bottomRight
  return {
    x: left,
    y: top,
    w: right - left,
    h: bottom - top
  }
}

export const boundingBoxToVertices = (rawData: CommentBoundingBox): CommentVertices => {
  const topLeft = new EditablePoint<'Image'>({ x: rawData.x, y: rawData.y })
  const bottomRight = new EditablePoint<'Image'>({
    x: rawData.x + rawData.w,
    y: rawData.y + rawData.h
  })
  const topRight = new EditablePoint<'Image'>({ x: bottomRight.x, y: topLeft.y })
  const bottomLeft = new EditablePoint<'Image'>({ x: topLeft.x, y: bottomRight.y })
  return {
    topLeft,
    bottomRight,
    topRight,
    bottomLeft
  }
}
