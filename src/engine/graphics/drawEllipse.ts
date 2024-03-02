import { View } from '@/engine/models'
import { euclideanDistance } from '@/engineCommon/algebra'
import { ImageManipulationFilter } from '@/engineCommon/imageManipulation'
import { EditableImagePoint } from '@/engineCommon/point'
import { RGBA, rgbaString } from '@/utils'

import { drawVertex } from './drawVertex'
import { strokeStyle } from './strokeStyle'

export const drawEllipse = (
  view: View,
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
  const ctx = view.annotationsLayer.context
  if (!ctx) { return }

  ctx.lineWidth = view.camera.lineWidth
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
  view.camera.imageViewCtxToCanvasViewCtx(ctx)
  // the line width will change at different zoom levels.
  ctx.lineWidth = view.camera.lineWidth * 1.0 / view.camera.scale
  ctx.stroke(path)
  ctx.fill(path, 'evenodd')
  ctx.restore()

  if (isSelected) {
    drawVertex(ctx, view.camera, right, filter, color, isSelected)
    drawVertex(ctx, view.camera, top, filter, color, isSelected)
    drawVertex(ctx, view.camera, left, filter, color, isSelected)
    drawVertex(ctx, view.camera, bottom, filter, color, isSelected)
  }

  return path
}
