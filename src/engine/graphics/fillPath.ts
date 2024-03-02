import { View } from '@/engine/models'
import { ImageManipulationFilter } from '@/engineCommon/imageManipulation'
import { EditableCanvasPoint, EditableImagePoint } from '@/engineCommon/point'
import { RGBA, rgbaString } from '@/utils'

export function fillPath (
  view: View,
  path: EditableImagePoint[],
  color: RGBA,
  filter: ImageManipulationFilter | null,
  isHighlighted = false,
  isSelected = false
): Path2D | undefined {
  const ctx = view.annotationsLayer.context
  if (!ctx) { return }

  ctx.beginPath()
  path.forEach((point, i) => {
    const canvasPoint = view.camera.imageViewToCanvasView(point) as EditableCanvasPoint
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
