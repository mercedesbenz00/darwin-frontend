import { IView } from '@/engine/models/views/types'
import { ImageManipulationFilter } from '@/engineCommon/imageManipulation'
import { ImagePoint, Point } from '@/engineCommon/point'
import { RGBA } from '@/utils'

import { lineWidth } from './lineWidth'
import { strokeStyle } from './strokeStyle'

export const drawLink = (
  view: IView,
  path: ImagePoint[],
  color: RGBA,
  filter: ImageManipulationFilter | null,
  isSelected: boolean = false
): void => {
  const [startingPoint, endingPoint] = path.map(point => view.camera.imageViewToCanvasView(point))

  const ctx = view.annotationsLayer.context
  if (!ctx) { return }

  ctx.save()

  ctx.lineWidth = lineWidth(view.camera) * 2.0

  const style = strokeStyle(color, filter, false, isSelected)

  ctx.strokeStyle = style
  ctx.fillStyle = style

  const angle = Math.atan2(endingPoint.y - startingPoint.y, endingPoint.x - startingPoint.x)
  const distanceFromCentroid = 15

  const actualEndingPoint = endingPoint.sub(new Point<'Canvas'>({
    x: distanceFromCentroid * Math.cos(angle),
    y: distanceFromCentroid * Math.sin(angle)
  }))

  ctx.beginPath()
  ctx.moveTo(startingPoint.x, startingPoint.y)
  ctx.lineTo(actualEndingPoint.x, actualEndingPoint.y)
  ctx.stroke()

  // Draw tip
  ctx.translate(actualEndingPoint.x, actualEndingPoint.y)
  ctx.rotate(angle + Math.PI / 2)
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(7, 13)
  ctx.lineTo(0, 11)
  ctx.lineTo(-7, 13)
  ctx.closePath()
  ctx.fill()

  ctx.restore()
}
