import { CanvasPoint } from '@/engineCommon/point'
import { Rectangle } from '@/engineCommon/rectangle'

export const drawOverlay = (
  ctx: CanvasRenderingContext2D,
  { width, height }: { width: number, height: number },
  canvasRectangle: Rectangle<'Canvas'>
) => {
  ctx.beginPath()
  ctx.rect(0, 0, canvasRectangle.left, height)
  ctx.rect(canvasRectangle.right, 0, width, height)
  ctx.rect(canvasRectangle.left, 0, canvasRectangle.right, canvasRectangle.top)
  ctx.rect(canvasRectangle.left, canvasRectangle.bottom, canvasRectangle.right, height)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
  ctx.fill()
  ctx.closePath()
}

export const drawClick = (
  ctx: CanvasRenderingContext2D,
  point: CanvasPoint,
  radius: number,
  color: string
) => {
  // Draw external circle
  ctx.beginPath()
  ctx.arc(point.x, point.y, radius + 1, 0, 2 * Math.PI)
  ctx.fillStyle = 'white'
  ctx.fill()
  ctx.closePath()
  // Draw count circle
  ctx.beginPath()
  ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI)
  ctx.fillStyle = color
  ctx.fill()
  ctx.closePath()
}

export const drawPendingClick = (
  ctx: CanvasRenderingContext2D,
  point: CanvasPoint,
  radius: number,
  color: string
) => {
  // Draw external circle
  ctx.beginPath()
  ctx.arc(point.x, point.y, radius + 1, 0, 2 * Math.PI)
  ctx.fillStyle = 'yellow'
  ctx.fill()
  ctx.closePath()
  // Draw count circle
  ctx.beginPath()
  ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI)
  ctx.fillStyle = color
  ctx.fill()
  ctx.closePath()
}
