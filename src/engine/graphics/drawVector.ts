import { IView } from '@/engine/models/views/types'
import { ImageManipulationFilter } from '@/engineCommon/imageManipulation'
import { ImagePoint, Point } from '@/engineCommon/point'
import { RGBA, rgbaString } from '@/utils'

export function drawVector (
  view: IView,
  centroid: ImagePoint,
  vector: {angle: number, length: number},
  color: RGBA,
  filter: ImageManipulationFilter | null
): Path2D | undefined {
  const ctx = view.annotationsLayer.context
  if (!ctx) { return }

  const tip = centroid.add(
    new Point<'Image'>({
      x: vector.length * Math.cos(vector.angle),
      y: vector.length * Math.sin(vector.angle)
    })
  )
  const canvasCentroid = view.camera.imageViewToCanvasView(centroid)
  const canvasTip = view.camera.imageViewToCanvasView(tip)

  ctx.strokeStyle = filter ? rgbaString(color, filter.borderOpacity / 100.0) : rgbaString(color)
  ctx.fillStyle = filter ? rgbaString(color, filter.borderOpacity / 100.0) : rgbaString(color)
  ctx.lineWidth = view.camera.lineWidth
  ctx.lineJoin = 'round'

  ctx.save()

  // Draw line
  ctx.beginPath()
  ctx.moveTo(canvasCentroid.x, canvasCentroid.y)
  ctx.lineTo(canvasTip.x, canvasTip.y)
  ctx.stroke()

  // Draw tip
  ctx.translate(canvasTip.x, canvasTip.y)
  ctx.rotate(vector.angle + Math.PI / 2)
  ctx.moveTo(0, 0)
  ctx.lineTo(5, 8)
  ctx.lineTo(-5, 8)
  ctx.closePath()
  ctx.fill()

  ctx.restore()
}
