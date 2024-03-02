import { Camera } from '@/engineCommon/camera'
import { ImageManipulationFilter } from '@/engineCommon/imageManipulation'
import { EditableImagePoint } from '@/engineCommon/point'
import { strokeStyle } from '@/engineV2/graphics'
import { DrawCallback } from '@/engineV2/models/layers'
import { RGBA, rgbaString } from '@/utils'

export function drawPointV2 (
  drawFn: DrawCallback,
  camera: Camera,
  point: EditableImagePoint,
  color: RGBA,
  filter: ImageManipulationFilter | null,
  isHighlighted = false,
  isSelected = false
): void {
  drawFn(ctx => {
    const canvasPoint = point
    const pointSize = (isHighlighted || isSelected) ? 5.5 : 3.5
    ctx.lineWidth = 1 / camera.scale
    ctx.strokeStyle = strokeStyle(color, filter, false, isSelected)
    ctx.fillStyle = rgbaString(color, (isHighlighted || isSelected) ? 0.1 : 1)
    ctx.beginPath()
    ctx.arc(
      canvasPoint.x,
      canvasPoint.y,
      pointSize / camera.scale,
      0,
      2 * Math.PI
    )
    ctx.fill()
    ctx.stroke()
  })
}

/**
 * @deprecated
 */
export function drawPoint (
  camera: Camera,
  ctx: CanvasRenderingContext2D,
  point: EditableImagePoint,
  color: RGBA,
  filter: ImageManipulationFilter | null,
  isHighlighted = false,
  isSelected = false
): void {
  const canvasPoint = camera.imageViewToCanvasView(point)
  const pointSize = (isHighlighted || isSelected) ? 5.5 : 3.5
  ctx.strokeStyle = strokeStyle(color, filter, false, isSelected)
  ctx.fillStyle = rgbaString(color, (isHighlighted || isSelected) ? 0.1 : 1)
  ctx.beginPath()
  ctx.arc(canvasPoint.x, canvasPoint.y, pointSize, 0, 2 * Math.PI)
  ctx.fill()
  ctx.stroke()
  ctx.closePath()
}
