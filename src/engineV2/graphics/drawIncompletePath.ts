import { Camera } from '@/engineCommon/camera'
import { CanvasPoint, ImagePoint, Point } from '@/engineCommon/point'

export function drawIncompletePath (
  path: ImagePoint[],
  ctx: CanvasRenderingContext2D,
  camera: Camera,
  colorString: string
): void {
  ctx.strokeStyle = colorString
  ctx.lineWidth = camera.lineWidth

  const canvasRadius = 3.5
  const imageRadius = 3.5 / camera.scale
  const pathLength = path.length

  const actualPath: ImagePoint[] = []

  // Compute the initial point of the path to be drawn to the canvas.
  // If the path only contains one point, the initial point is just the only point in the path.
  // Otherwise, the inital point does not correspond to the center point of the first vertex,
  // but it's translated by an offset that corresponds to the radius of the vertex, in the direction
  // of the first segment of the path
  let initialPoint = path[0]
  if (pathLength > 1) {
    const initialAlpha = Math.atan2(path[1].y - path[0].y, path[1].x - path[0].x)

    initialPoint = new Point<'Image'>({
      x: path[0].x + imageRadius * Math.cos(initialAlpha),
      y: path[0].y + imageRadius * Math.sin(initialAlpha)
    })
  }
  actualPath.push(initialPoint)

  // If the path includes more than 2 points, add all the points between the first and the last
  if (pathLength > 2) {
    for (let i = 1; i < pathLength - 1; i++) {
      actualPath.push(path[i])
    }
  }

  // If the path includes more than 1 point, then add the final point as the center point of the
  // last vertex, translated by an offset of the radius of the vertex, in the opposite direction
  // of the last segment of the path
  if (pathLength > 1) {
    const finalAlpha = Math.atan2(
      path[pathLength - 2].y - path[pathLength - 1].y,
      path[pathLength - 2].x - path[pathLength - 1].x
    )

    const finalPoint = new Point<'Image'>({
      x: path[pathLength - 1].x + imageRadius * Math.cos(finalAlpha),
      y: path[pathLength - 1].y + imageRadius * Math.sin(finalAlpha)
    })

    actualPath.push(finalPoint)
  }

  actualPath.forEach((point: ImagePoint, index: number) => {
    const canvasPoint = camera.imageViewToCanvasView(point) as CanvasPoint
    ctx.beginPath()
    if (index === 0) {
      ctx.moveTo(canvasPoint.x, canvasPoint.y)
    } else {
      if (index === pathLength - 1) {
        ctx.strokeStyle = colorString
      }
      const prevPoint = camera.imageViewToCanvasView(actualPath[index - 1])
      ctx.moveTo(prevPoint.x, prevPoint.y)
      ctx.lineTo(canvasPoint.x, canvasPoint.y)
    }
    ctx.stroke()
    ctx.closePath()
  })

  ctx.fillStyle = 'rgba(255, 255, 255, 0)'
  for (const index of [0, pathLength - 1]) {
    const point = path[index]
    if (index === path.length - 1) {
      ctx.strokeStyle = colorString
    }
    const canvasPoint = camera.imageViewToCanvasView(point)
    ctx.beginPath()
    ctx.arc(canvasPoint.x, canvasPoint.y, canvasRadius, 0, 2 * Math.PI)
    ctx.fill()
    ctx.stroke()
    ctx.closePath()
  }
}
