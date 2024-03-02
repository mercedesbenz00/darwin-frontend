import { strokeStyle } from '@/engine/graphics'
import { View } from '@/engine/models'
import { ImageManipulationFilter } from '@/engineCommon/imageManipulation'
import { EditableImagePoint } from '@/engineCommon/point'
import { RGBA, rgbaString } from '@/utils'

export function drawPoint (
  view: View,
  point: EditableImagePoint,
  color: RGBA,
  filter: ImageManipulationFilter | null,
  isHighlighted = false,
  isSelected = false
): void {
  const ctx = view.annotationsLayer.context
  if (!ctx) { return }
  const canvasPoint = view.camera.imageViewToCanvasView(point)
  const pointSize = (isHighlighted || isSelected) ? 5.5 : 3.5
  ctx.strokeStyle = strokeStyle(color, filter, false, isSelected)
  ctx.fillStyle = rgbaString(color, (isHighlighted || isSelected) ? 0.1 : 1)
  ctx.beginPath()
  ctx.arc(canvasPoint.x, canvasPoint.y, pointSize, 0, 2 * Math.PI)
  ctx.fill()
  ctx.stroke()
  ctx.closePath()
}
