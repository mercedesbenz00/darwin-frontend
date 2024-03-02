import { CanvasPoint, Point } from '@/engineCommon/point'

export type CanvasEvent = MouseEvent | TouchEvent

const getFirstTouch = (event: TouchEvent): CanvasPoint | null => {
  const target = event.target as Element
  if (!target) { return null }

  const bcr = target.getBoundingClientRect()
  const touch = event.targetTouches[0]
  const x = touch.clientX - bcr.x
  const y = touch.clientY - bcr.y

  return new Point<'Canvas'>({ x, y })
}

export const isTouchEvent = (event: CanvasEvent): event is TouchEvent => {
  if ('targetTouches' in event) { return true }
  return false
}

export const resolveEventPoint = (
  event: CanvasEvent,
  ignoreTouch: boolean = false
): CanvasPoint | null => {
  if (event instanceof MouseEvent) {
    return new Point<'Canvas'>({ x: event.offsetX, y: event.offsetY })
  }
  if (isTouchEvent(event) && !ignoreTouch) {
    return getFirstTouch(event)
  }
  return null
}
