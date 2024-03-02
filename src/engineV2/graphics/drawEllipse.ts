import { euclideanDistance } from '@/engineCommon/algebra'
import { Camera } from '@/engineCommon/camera'
import { ImageManipulationFilter } from '@/engineCommon/imageManipulation'
import { EditableImagePoint } from '@/engineCommon/point'
import { DrawCallback } from '@/engineV2/models/layers'
import { RGBA, rgbaString } from '@/utils'

import { drawVertex, drawVertexV2 } from './drawVertex'
import { strokeStyle } from './strokeStyle'

export const drawEllipseV2 = (
  drawFn: DrawCallback,
  camera: Camera,
  ellipse: {
    center: EditableImagePoint
    right: EditableImagePoint
    top: EditableImagePoint
    bottom: EditableImagePoint
    left: EditableImagePoint
  },
  color: RGBA,
  filter: ImageManipulationFilter | null,
  isHighlighted = false,
  isSelected = false
): void => {
  const { center, top, right, left, bottom } = ellipse

  drawFn(ctx => {
    ctx.lineWidth = camera.lineWidth
    ctx.strokeStyle = strokeStyle(color, filter, false, isSelected)
    ctx.fillStyle = filter
      ? rgbaString(color, ((isHighlighted || isSelected) ? 0.1 : (filter.opacity / 100.0)))
      : rgbaString(color, ((isHighlighted || isSelected) ? 0.1 : 0.15))

    const radius = { x: euclideanDistance(center, right), y: euclideanDistance(center, top) }
    const angle = Math.atan2(right.y - center.y, right.x - center.x)

    const path = new Path2D()
    path.ellipse(ellipse.center.x, ellipse.center.y, radius.x, radius.y, angle, 0, 2 * Math.PI)

    ctx.lineWidth = camera.lineWidth * 1.0 / camera.scale
    ctx.stroke(path)
    ctx.fill(path, 'evenodd')
  })

  if (isSelected) {
    drawVertexV2(drawFn, camera, right, filter, color, isSelected, false)
    drawVertexV2(drawFn, camera, top, filter, color, isSelected, false)
    drawVertexV2(drawFn, camera, left, filter, color, isSelected, false)
    drawVertexV2(drawFn, camera, bottom, filter, color, isSelected, false)
  }
}

/**
 * @deprecated
 */
export const drawEllipse = (
  camera: Camera,
  ctx: CanvasRenderingContext2D,
  ellipse: {
    center: EditableImagePoint
    right: EditableImagePoint
    top: EditableImagePoint
    bottom: EditableImagePoint
    left: EditableImagePoint
  },
  color: RGBA,
  filter: ImageManipulationFilter | null,
  isHighlighted = false,
  isSelected = false
): Path2D | undefined => {
  ctx.lineWidth = camera.lineWidth
  ctx.strokeStyle = strokeStyle(color, filter, false, isSelected)
  ctx.fillStyle = filter
    ? rgbaString(color, ((isHighlighted || isSelected) ? 0.1 : (filter.opacity / 100.0)))
    : rgbaString(color, ((isHighlighted || isSelected) ? 0.1 : 0.15))

  const { center, top, right, left, bottom } = ellipse
  const radius = { x: euclideanDistance(center, right), y: euclideanDistance(center, top) }
  const angle = Math.atan2(right.y - center.y, right.x - center.x)

  const path = new Path2D()
  path.ellipse(ellipse.center.x, ellipse.center.y, radius.x, radius.y, angle, 0, 2 * Math.PI)

  ctx.save()
  camera.imageViewCtxToCanvasViewCtx(ctx)
  // the line width will change at different zoom levels.
  ctx.lineWidth = camera.lineWidth * 1.0 / camera.scale
  ctx.stroke(path)
  ctx.fill(path, 'evenodd')
  ctx.restore()

  if (isSelected) {
    drawVertex(ctx, camera, right, filter, color, isSelected)
    drawVertex(ctx, camera, top, filter, color, isSelected)
    drawVertex(ctx, camera, left, filter, color, isSelected)
    drawVertex(ctx, camera, bottom, filter, color, isSelected)
  }

  return path
}
