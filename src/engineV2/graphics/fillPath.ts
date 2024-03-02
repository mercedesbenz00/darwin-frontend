import { Camera } from '@/engineCommon/camera'
import { ImageManipulationFilter } from '@/engineCommon/imageManipulation'
import { EditableCanvasPoint, EditableImagePoint } from '@/engineCommon/point'
import { DrawCallback } from '@/engineV2/models/layers'
import { RGBA, rgbaString } from '@/utils'

export function fillPathV2 (
  drawFn: DrawCallback,
  path: EditableImagePoint[],
  color: RGBA,
  filter: ImageManipulationFilter | null,
  isHighlighted = false,
  isSelected = false
): void {
  drawFn(ctx => {
    ctx.beginPath()
    path.forEach((point, i) => {
      if (i === 0) {
        ctx.moveTo(point.x, point.y)
      } else {
        ctx.lineTo(point.x, point.y)
      }
    })
    ctx.closePath()
    ctx.fillStyle = filter
      ? rgbaString(color, ((isHighlighted || isSelected) ? 0.1 : (filter.opacity / 100.0)))
      : rgbaString(color, ((isHighlighted || isSelected) ? 0.1 : 0.15))
    ctx.fill()
  })
}

/**
 * @deprecated
 */
export function fillPath (
  camera: Camera,
  ctx: CanvasRenderingContext2D,
  path: EditableImagePoint[],
  color: RGBA,
  filter: ImageManipulationFilter | null,
  isHighlighted = false,
  isSelected = false
): void {
  ctx.beginPath()
  path.forEach((point, i) => {
    const canvasPoint = camera.imageViewToCanvasView(point) as EditableCanvasPoint
    if (i === 0) {
      ctx.moveTo(canvasPoint.x, canvasPoint.y)
    } else {
      ctx.lineTo(canvasPoint.x, canvasPoint.y)
    }
  })
  ctx.closePath()
  ctx.fillStyle = filter
    ? rgbaString(color, ((isHighlighted || isSelected) ? 0.1 : (filter.opacity / 100.0)))
    : rgbaString(color, ((isHighlighted || isSelected) ? 0.1 : 0.15))
  ctx.fill()
}
