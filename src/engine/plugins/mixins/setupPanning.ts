import { Editor } from '@/engine/editor'
import { ToolContext } from '@/engine/managers'
import { isModifierPressed } from '@/engine/utils'
import { CallbackStatus } from '@/engineCommon/callbackHandler'
import { CanvasPoint, Point } from '@/engineCommon/point'
import { isLeftMouseButton, isMiddleMouseButton } from '@/utils/mouse'

import { resolveLoadedItem } from './resolveLoadedItem'
import { touchMiddlePoint } from './utils'

const KEY_OFFSET = 28

type PanningContext = {
  panCursorStart: CanvasPoint | null
  panOriginalOffset: CanvasPoint | null
}

const getCursorPoint = (event: MouseEvent, editor: Editor): CanvasPoint => {
  if (editor.viewsList.length === 1) {
    return new Point({ x: event.offsetX, y: event.offsetY })
  } else {
    return editor.camera.getOffset()
  }
}

/**
 * Tells us if the mouse pan was past the minimal threshold.
 *
 * This allows us to use mouse primary button panning in conjunction with the
 * keypoint tool, for example, where the keypoint doesn't need dragging and is
 * drawn by a single click.
 */
const didMovePastThreshold = (startOffset: CanvasPoint, endOffset: CanvasPoint): boolean => {
  const delta = startOffset.sub(endOffset) || new Point({ x: 0, y: 0 })

  const deltaX = Math.abs(delta?.x || 0)
  const deltaY = Math.abs(delta?.y || 0)

  return (deltaX > 10 || deltaY > 10)
}

const exitMousePanning = (
  event: MouseEvent,
  panningContext: PanningContext,
  toolContext: ToolContext
): CallbackStatus => {
  event.preventDefault()
  toolContext.editor.activeView.mainLayer.canvas.ownerDocument.exitPointerLock()

  const currentOffset = toolContext.editor.camera.getOffset()

  // before reseting, we figure out if the pan was big enough to be considered
  // an actual pan, and not just a random click
  const movedPastThreshold = !!panningContext.panOriginalOffset &&
    didMovePastThreshold(panningContext.panOriginalOffset, currentOffset)

  panningContext.panCursorStart = null
  panningContext.panOriginalOffset = null
  toolContext.editor.activeView.annotationsLayer.changed()

  if (movedPastThreshold) {
    return CallbackStatus.Stop
  } else {
    return CallbackStatus.Continue
  }
}

const enterMousePanning = (
  event: MouseEvent,
  panningContext: PanningContext,
  toolContext: ToolContext
): void => {
  event.preventDefault()

  panningContext.panCursorStart = getCursorPoint(event, toolContext.editor)
  panningContext.panOriginalOffset = toolContext.editor.camera.getOffset()
}

const doMousePanning = (
  event: MouseEvent,
  panningContext: PanningContext,
  toolContext: ToolContext
): CallbackStatus => {
  if (panningContext.panCursorStart === null) { return CallbackStatus.Continue }
  if (panningContext.panOriginalOffset === null) { return CallbackStatus.Continue }
  toolContext.editor.activeView.mainLayer.changed()

  if (toolContext.editor.viewsList.length === 1) {
    const cursorPoint: CanvasPoint = new Point({ x: event.offsetX, y: event.offsetY })
    const newOffset = panningContext.panCursorStart
      .sub(cursorPoint)
      .mul(2)
      .add(panningContext.panOriginalOffset)

    toolContext.editor.camera.setOffset(newOffset)
  } else {
    toolContext.editor.activeView.mainLayer.canvas.requestPointerLock()

    const cursorPoint: CanvasPoint = new Point({ x: event.movementX, y: event.movementY })
    panningContext.panCursorStart = panningContext.panCursorStart.sub(cursorPoint)

    toolContext.editor.camera.setOffset(panningContext.panCursorStart)
  }

  toolContext.editor.activeView.annotationsLayer.changed()
  return CallbackStatus.Stop
}

/**
 * Sets up panning using primary mouse button
 */
export const setupPrimaryButtonPanning = (context: ToolContext): void => {
  const panningContext: PanningContext = {
    panCursorStart: null,
    panOriginalOffset: null
  }
  context.handles.push(
    ...context.editor.onMouseDown((event) => {
      if (!isLeftMouseButton(event)) { return CallbackStatus.Continue }
      return enterMousePanning(event, panningContext, context)
    })
  )

  context.handles.push(
    ...context.editor.onMouseMove((event) => doMousePanning(event, panningContext, context))
  )

  context.handles.push(
    ...context.editor.onMouseUp((event) => exitMousePanning(event, panningContext, context))
  )

  context.handles.push(
    ...context.editor.onMouseLeave(() => { panningContext.panCursorStart = null })
  )
}

/**
 * Sets up panning using touch events
 */
export const setupTouchPanning = (context: ToolContext): void => {
  const panningContext: PanningContext = {
    panCursorStart: null,
    panOriginalOffset: null
  }

  context.handles.push(...context.editor.onTouchStart(event => {
    event.preventDefault()

    const length = event.targetTouches.length
    if (length !== 3) { return }

    panningContext.panCursorStart = touchMiddlePoint(event)
    panningContext.panOriginalOffset = context.editor.camera.getOffset()
    return CallbackStatus.Stop
  }))

  context.handles.push(...context.editor.onTouchMove(event => {
    const cursorPoint = touchMiddlePoint(event)
    if (panningContext.panCursorStart !== null && panningContext.panOriginalOffset !== null) {
      context.editor.camera.setOffset(
        panningContext.panCursorStart.sub(cursorPoint).add(panningContext.panOriginalOffset)
      )
      context.editor.activeView.annotationsLayer.changed()
      return CallbackStatus.Stop
    }
  }))

  context.handles.push(...context.editor.onTouchEnd(() => {
    panningContext.panCursorStart = null
    context.editor.activeView.annotationsLayer.changed()
  }))
}

/**
 * Sets up panning using WASD keys
 */
export const setupWASDPanning = (context: ToolContext): void => {
  const keyStatus: {
    KeyW: boolean
    KeyA: boolean
    KeyS: boolean
    KeyD: boolean
  } = { KeyW: false, KeyA: false, KeyS: false, KeyD: false }
  type VALID_KEYCODES = keyof typeof keyStatus

  const computePanDeltaFromKey = (withShift: boolean): { x: number, y: number } => {
    const times = withShift ? 2 : 1
    const delta = { x: 0, y: 0 }
    if (keyStatus.KeyW) { delta.y = -KEY_OFFSET * times }
    if (keyStatus.KeyA) { delta.x = -KEY_OFFSET * times }
    if (keyStatus.KeyS) { delta.y = KEY_OFFSET * times }
    if (keyStatus.KeyD) { delta.x = KEY_OFFSET * times }

    return delta
  }

  const performScroll = (event: KeyboardEvent): void => {
    if (context.editor.isImageLoading) { return }

    const loadedItem = resolveLoadedItem(context.editor)
    if (!loadedItem) { return }

    const delta = computePanDeltaFromKey(event.shiftKey)
    const deltaPoint = new Point(delta) as CanvasPoint
    context.editor.camera.scroll(deltaPoint)

    context.editor.activeView.annotationsLayer.changed()
    event.preventDefault()
  }

  type PanEvent = KeyboardEvent & { code: VALID_KEYCODES }

  const isValidPanEvent = (event: KeyboardEvent): event is PanEvent => {
    if (isModifierPressed(event)) { return false }
    if (event.metaKey || event.ctrlKey || event.altKey) { return false }
    if (!['KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(event.code)) { return false }
    return true
  }

  context.handles.push(...context.editor.onKeyDown(event => {
    if (!isValidPanEvent(event)) { return }

    const { code } = event
    keyStatus[code] = true

    // Should override opposite behavior to avoid racing conditions
    if (code === 'KeyW') { keyStatus.KeyS = false }
    if (code === 'KeyS') { keyStatus.KeyW = false }
    if (code === 'KeyA') { keyStatus.KeyD = false }
    if (code === 'KeyD') { keyStatus.KeyA = false }

    context.editor.activeView.mainLayer.changed()

    performScroll(event)
  }))

  context.handles.push(...context.editor.onKeyPress(event => {
    if (!isValidPanEvent(event)) { return }

    performScroll(event)
  }))

  context.handles.push(...context.editor.onKeyUp(event => {
    if (!isValidPanEvent(event)) { return }

    const { code } = event
    keyStatus[code] = false
  }))
}

/**
 * Sets up panning by holding the mouse wheel pressed
 *
 * This type of panning is used when an annotation type tool is selected, to allow for
 * panning while the mouse click, touch and cursor keys are taken by other actions.
 */
export const setupWheelPanning = (context: ToolContext): void => {
  const panningContext: PanningContext = {
    panCursorStart: null,
    panOriginalOffset: null
  }

  context.handles.push(...context.editor.onMouseDown(event => {
    // we do not initiate unless the middle mouse button is pressed
    if (!isMiddleMouseButton(event)) { return CallbackStatus.Continue }
    return enterMousePanning(event, panningContext, context)
  }))

  context.handles.push(
    ...context.editor.onMouseMove((event) =>
      doMousePanning(event, panningContext, context)
    )
  )

  context.handles.push(
    ...context.editor.onMouseUp((event) =>
      exitMousePanning(event, panningContext, context)
    )
  )
}
