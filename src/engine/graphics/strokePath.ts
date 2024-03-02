import { View } from '@/engine/models'
import { ImageManipulationFilter } from '@/engineCommon/imageManipulation'
import { EditableCanvasPoint, EditableImagePoint } from '@/engineCommon/point'
import { RGBA, rgbaString } from '@/utils'

export function strokePath (
  view: View,
  path: EditableImagePoint[],
  color: RGBA,
  filter: ImageManipulationFilter | null,
  isSelected = false
): Path2D | undefined {
  const ctx = view.annotationsLayer.context
  if (!ctx) { return }
  ctx.lineWidth = view.camera.lineWidth
  if (filter) {
    ctx.strokeStyle = rgbaString(
      color,
      isSelected ? (filter.borderOpacity / 100.0) : (filter.borderOpacity / 100.0 * 0.5)
    )
  } else {
    ctx.strokeStyle = rgbaString(color, isSelected ? 1 : 0.5)
  }

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
  ctx.stroke()

  ctx.lineJoin = 'round'
  ctx.lineWidth = view.camera.lineWidth
  for (const point of path) {
    // if (!point.editable) continue
    const canvasPoint = view.camera.imageViewToCanvasView(point) as EditableCanvasPoint
    if (isSelected) {
      let pointSize = 3.5
      if (point.isSelected) {
        pointSize = 5.5
        ctx.fillStyle = filter ? rgbaString(color, filter.opacity) : rgbaString(color)
      } else if (point.isHighlighted) {
        pointSize = 5.5
        ctx.fillStyle = 'rgb(255, 255, 255)'
      } else {
        pointSize = 3.5
        ctx.fillStyle = 'rgb(255, 255, 255)'
      }
      ctx.beginPath()
      ctx.arc(canvasPoint.x, canvasPoint.y, pointSize, 0, 2 * Math.PI)
      ctx.fill()
      ctx.stroke()
      ctx.closePath()
    }
  }
}
