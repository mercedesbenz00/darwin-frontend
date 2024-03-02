import { CanvasPoint } from '@/engineCommon/point'
import { View } from '@/engineV2/views'

export const drawGuideLines = (
  ctx: CanvasRenderingContext2D, 
  view: View, 
  point: CanvasPoint
): void => {
  ctx.beginPath()
  ctx.lineWidth = 0.5
  ctx.strokeStyle = 'rgb(227, 234, 242)' // Alice Shade
  ctx.moveTo(point.x, 0)
  ctx.lineTo(point.x, view.height)
  ctx.moveTo(0, point.y)
  ctx.lineTo(view.width, point.y)
  ctx.stroke()
}
