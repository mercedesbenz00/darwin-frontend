import { euclideanDistance } from '@/engineCommon/algebra'
import { CanvasPoint, Point } from '@/engineCommon/point'

export const touchMiddlePoint = (event: TouchEvent): CanvasPoint => {
  const point = new Point<'Canvas'>({ x: 0, y: 0 })
  if (event.targetTouches.length === 0) { return point }

  for (const touch of event.targetTouches) {
    point.add_(new Point<'Canvas'>({ x: touch.clientX, y: touch.clientY }))
  }
  point.div_(event.targetTouches.length)

  return point
}

export const touchDistance = (event: TouchEvent) => {
  const { targetTouches } = event
  if (targetTouches.length !== 2) { return }

  const [point1, point2] = targetTouches

  return euclideanDistance(
    { x: point1.clientX, y: point1.clientY },
    { x: point2.clientX, y: point2.clientY }
  )
}
