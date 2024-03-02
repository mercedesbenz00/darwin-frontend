import { Rectangle } from '@/engineCommon/rectangle'

export const drawDashedBox = (
  ctx: CanvasRenderingContext2D,
  canvasRectangle: Rectangle<'Canvas'>
): void => {
  ctx.save()
  ctx.beginPath()
  ctx.setLineDash([5, 5])
  ctx.strokeStyle = 'rgba(227, 234, 242, 0.5)' // Alice Shade
  ctx.lineWidth = 1
  ctx.strokeRect(
    canvasRectangle.left,
    canvasRectangle.top,
    canvasRectangle.width,
    canvasRectangle.height
  )
  ctx.closePath()
  ctx.restore()
}
