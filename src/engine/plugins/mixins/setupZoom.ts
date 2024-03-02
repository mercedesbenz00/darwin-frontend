import { ToolContext } from '@/engine/managers'
import { CallbackStatus } from '@/engineCommon/callbackHandler'
import { CanvasPoint, Point } from '@/engineCommon/point'

import { resolveLoadedItem } from './resolveLoadedItem'
import { touchDistance, touchMiddlePoint } from './utils'

export function setupZoom (context: ToolContext): void {
  let cursorPoint: CanvasPoint | null = null
  let prevScale: number = 1

  let pinchStart: CanvasPoint | null = null
  let prevPinchWidth: number = 1

  context.handles.push(...context.editor.onMouseMove(event => {
    cursorPoint = new Point({ x: event.offsetX, y: event.offsetY })
  }))

  context.handles.push(...context.editor.onWheel(event => {
    if (cursorPoint === null) { return }

    context.editor.activeView.mainLayer.changed()

    event.preventDefault()
    if (event.shiftKey && (context.editor.activeView.loadedImage || context.editor.loadedVideo)) {
      const loadedItem = resolveLoadedItem(context.editor)
      if (!loadedItem) { return }
      context.editor.camera.scroll(new Point({ x: event.deltaX, y: event.deltaY }))
    } else {
      const zoomLevel = Math.max(Math.min(Math.exp(-event.deltaY / 100), 1.4), 0.6)
      context.editor.camera.zoom(zoomLevel, cursorPoint)
    }
    context.editor.activeView.annotationsLayer.changed()
    return CallbackStatus.Stop
  }))

  context.handles.push(...context.editor.onGestureStart(event => {
    event.preventDefault()
    prevScale = (event as unknown as { scale: number }).scale
  }))

  context.handles.push(...context.editor.onGestureChange(event => {
    if (cursorPoint === null) { return }
    const scale = (event as unknown as { scale: number }).scale
    event.preventDefault()
    context.editor.camera.zoom(scale / prevScale, cursorPoint)
    prevScale = scale
    context.editor.activeView.annotationsLayer.changed()
    return CallbackStatus.Stop
  }))

  context.handles.push(...context.editor.onGestureEnd(event => { event.preventDefault() }))

  context.handles.push(...context.editor.onTouchStart(event => {
    event.preventDefault()

    const length = event.targetTouches.length
    if (length !== 2) { return CallbackStatus.Stop }

    pinchStart = touchMiddlePoint(event)
    prevPinchWidth = touchDistance(event) || 1

    return CallbackStatus.Stop
  }))

  context.handles.push(...context.editor.onTouchMove(event => {
    if (!pinchStart) { return }

    const pinchWidth = touchDistance(event)
    if (!pinchWidth) { return }

    context.editor.camera.zoom(pinchWidth / prevPinchWidth, pinchStart)
    prevPinchWidth = pinchWidth

    context.editor.activeView.annotationsLayer.changed()
    return CallbackStatus.Stop
  }))

  context.handles.push(...context.editor.onTouchEnd(() => {
    pinchStart = null
    context.editor.activeView.annotationsLayer.changed()
  }))
}
