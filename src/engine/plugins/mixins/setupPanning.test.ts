import { ToolContext } from '@/engine/managers'
import { CallbackHandle, CallbackHandleCollection } from '@/engineCommon/callbackHandler'
import { CanvasPoint, Point } from '@/engineCommon/point'
import { MouseButton } from '@/utils/mouse'

import { setupWheelPanning, setupPrimaryButtonPanning } from './setupPanning'

const leftMouseDown = (): MouseEvent => ({
  button: MouseButton.LEFT,
  offsetX: 5,
  offsetY: 5,
  movementX: 7,
  movementY: 7,
  preventDefault: () => {}
}) as unknown as MouseEvent

const rightMouseDown = (): MouseEvent =>
  new MouseEvent('mousedown', { button: MouseButton.RIGHT })

const middleMouseDown = (): MouseEvent => ({
  button: MouseButton.MIDDLE,
  offsetX: 5,
  offsetY: 5,
  movementX: 7,
  movementY: 7,
  preventDefault: () => {}
}) as unknown as MouseEvent

class FakeEditor {
  onMouseDown (cb: (event: MouseEvent) => void): CallbackHandle[] {
    return [this.onMouseDownCallbacks.add(cb)]
  }

  onMouseUp (cb: (event: MouseEvent) => void): CallbackHandle[] {
    return [this.onMouseUpCallbacks.add(cb)]
  }

  onMouseMove (cb: (event: MouseEvent) => void): CallbackHandle[] {
    return [this.onMouseMoveCallbacks.add(cb)]
  }

  onMouseLeave (cb: (event: MouseEvent) => void): CallbackHandle[] {
    return [this.onMouseLeaveCallbacks.add(cb)]
  }

  viewsList = ['foo']

  activeView = {
    annotationsLayer: { changed: jest.fn() },
    mainLayer: {
      changed: jest.fn(),
      canvas: {
        ownerDocument: { exitPointerLock: jest.fn() },
        requestPointerLock: jest.fn()
      }
    }
  }

  camera = {
    getOffset (): CanvasPoint { return new Point({ x: 9, y: 9 }) },
    setOffset: jest.fn()
  }

  onMouseDownCallbacks: CallbackHandleCollection<[MouseEvent]> =
    new CallbackHandleCollection<[MouseEvent]>()

  onMouseUpCallbacks: CallbackHandleCollection<[MouseEvent]> =
    new CallbackHandleCollection<[MouseEvent]>()

  onMouseMoveCallbacks: CallbackHandleCollection<[MouseEvent]> =
    new CallbackHandleCollection<[MouseEvent]>()

  onMouseLeaveCallbacks: CallbackHandleCollection<[MouseEvent]> =
    new CallbackHandleCollection<[MouseEvent]>()
}

class FakeContext {
  editor: FakeEditor
  handles: CallbackHandle[]

  constructor () {
    this.editor = new FakeEditor()
    this.handles = []
  }
}

describe('setupWheelPanning', () => {
  it('does nothing on left or right button', () => {
    const context = new FakeContext()
    setupWheelPanning(context as unknown as ToolContext)

    const leftEvent = leftMouseDown()
    jest.spyOn(leftEvent, 'preventDefault')
    expect(() => context.editor.onMouseDownCallbacks.call(leftEvent)).not.toThrow()
    expect(leftEvent.preventDefault).not.toHaveBeenCalled()

    const rightEvent = rightMouseDown()
    jest.spyOn(rightEvent, 'preventDefault')
    expect(() => context.editor.onMouseDownCallbacks.call(rightEvent)).not.toThrow()
    expect(rightEvent.preventDefault).not.toHaveBeenCalled()
  })

  it('sets up panning on middle button', () => {
    const context = new FakeContext()
    setupWheelPanning(context as unknown as ToolContext)
    const event = middleMouseDown()
    jest.spyOn(event, 'preventDefault')
    context.editor.onMouseDownCallbacks.call(event)
    expect(event.preventDefault).toHaveBeenCalled()
  })

  it('performs panning on mouse move for single view', () => {
    const context = new FakeContext()
    setupWheelPanning(context as unknown as ToolContext)

    const event = middleMouseDown()
    context.editor.onMouseDownCallbacks.call(event)
    context.editor.onMouseMoveCallbacks.call(event)

    expect(context.editor.activeView.annotationsLayer.changed).toHaveBeenCalled()
    expect(context.editor.activeView.mainLayer.changed).toHaveBeenCalled()

    // same point as initial camera offset, as we didn't really actually move
    expect(context.editor.camera.setOffset).toHaveBeenCalledWith(new Point({ x: 9, y: 9 }))
  })

  it('performs panning on mouse move for multiple views', () => {
    const context = new FakeContext()
    context.editor.viewsList = ['foo', 'bar']

    setupWheelPanning(context as unknown as ToolContext)

    const event = middleMouseDown()
    context.editor.onMouseDownCallbacks.call(event)
    context.editor.onMouseMoveCallbacks.call(event)

    expect(context.editor.activeView.annotationsLayer.changed).toHaveBeenCalled()
    expect(context.editor.activeView.mainLayer.changed).toHaveBeenCalled()
    expect(context.editor.activeView.mainLayer.canvas.requestPointerLock).toHaveBeenCalled()

    // same point as initial camera offset, as we didn't really actually move
    expect(context.editor.camera.setOffset).toHaveBeenCalledWith(new Point({ x: 2, y: 2 }))
  })

  it('correctly exits pan', () => {
    const context = new FakeContext()
    setupWheelPanning(context as unknown as ToolContext)

    const event = middleMouseDown()
    jest.spyOn(event, 'preventDefault')

    context.editor.onMouseDownCallbacks.call(event)
    context.editor.onMouseMoveCallbacks.call(event)
    context.editor.onMouseUpCallbacks.call(event)

    expect(event.preventDefault).toHaveBeenCalled()
    expect(
      context.editor.activeView.mainLayer.canvas.ownerDocument.exitPointerLock
    ).toHaveBeenCalled()
  })

  it('allows further callback execution if there was not enough movement', () => {
    const context = new FakeContext()
    setupWheelPanning(context as unknown as ToolContext)

    const event = middleMouseDown()

    context.editor.onMouseDownCallbacks.call(event)

    const spy = jest.fn()
    context.editor.onMouseUpCallbacks.add(spy)
    context.editor.onMouseUpCallbacks.call(event)

    expect(spy).toHaveBeenCalled()
  })

  it('stops further callback execution if there was enough movement', () => {
    const context = new FakeContext()
    setupWheelPanning(context as unknown as ToolContext)

    const spy = jest.fn()
    const event = middleMouseDown()

    context.editor.onMouseDownCallbacks.call(event)

    jest.spyOn(context.editor.camera, 'getOffset').mockReturnValue(new Point({ x: 500, y: 500 }))

    context.editor.onMouseUpCallbacks.add(spy)
    context.editor.onMouseUpCallbacks.call(event)

    expect(spy).not.toHaveBeenCalled()
  })
})

describe('setupPrimaryButtonPanning', () => {
  it('does nothing on middle or right button', () => {
    const context = new FakeContext()
    setupPrimaryButtonPanning(context as unknown as ToolContext)

    const middleEvent = middleMouseDown()
    jest.spyOn(middleEvent, 'preventDefault')
    expect(() => context.editor.onMouseDownCallbacks.call(middleEvent)).not.toThrow()
    expect(middleEvent.preventDefault).not.toHaveBeenCalled()

    const rightEvent = rightMouseDown()
    jest.spyOn(rightEvent, 'preventDefault')
    expect(() => context.editor.onMouseDownCallbacks.call(rightEvent)).not.toThrow()
    expect(rightEvent.preventDefault).not.toHaveBeenCalled()
  })

  it('sets up panning on left button', () => {
    const context = new FakeContext()
    setupPrimaryButtonPanning(context as unknown as ToolContext)
    const event = leftMouseDown()
    jest.spyOn(event, 'preventDefault')
    context.editor.onMouseDownCallbacks.call(event)
    expect(event.preventDefault).toHaveBeenCalled()
  })

  it('performs panning on mouse move for single view', () => {
    const context = new FakeContext()
    context.editor.viewsList = ['foo']
    jest.spyOn(context.editor.camera, 'setOffset')

    setupPrimaryButtonPanning(context as unknown as ToolContext)

    const event = leftMouseDown()
    context.editor.onMouseDownCallbacks.call(event)
    context.editor.onMouseMoveCallbacks.call(event)

    expect(context.editor.activeView.annotationsLayer.changed).toHaveBeenCalled()
    expect(context.editor.activeView.mainLayer.changed).toHaveBeenCalled()

    // same point as initial camera offset, as we didn't really actually move
    expect(context.editor.camera.setOffset).toHaveBeenCalledWith(new Point({ x: 9, y: 9 }))
  })

  it('performs panning on mouse move for multiple views', () => {
    const context = new FakeContext()
    context.editor.viewsList = ['foo', 'bar']

    setupPrimaryButtonPanning(context as unknown as ToolContext)

    const event = leftMouseDown()
    context.editor.onMouseDownCallbacks.call(event)
    context.editor.onMouseMoveCallbacks.call(event)

    expect(context.editor.activeView.annotationsLayer.changed).toHaveBeenCalled()
    expect(context.editor.activeView.mainLayer.changed).toHaveBeenCalled()
    expect(context.editor.activeView.mainLayer.canvas.requestPointerLock).toHaveBeenCalled()

    // same point as initial camera offset, as we didn't really actually move
    expect(context.editor.camera.setOffset).toHaveBeenCalledWith(new Point({ x: 2, y: 2 }))
  })

  it('correctly exits pan', () => {
    const context = new FakeContext()
    setupPrimaryButtonPanning(context as unknown as ToolContext)

    const event = leftMouseDown()
    jest.spyOn(event, 'preventDefault')

    context.editor.onMouseDownCallbacks.call(event)
    context.editor.onMouseMoveCallbacks.call(event)
    context.editor.onMouseUpCallbacks.call(event)

    expect(event.preventDefault).toHaveBeenCalled()
    expect(
      context.editor.activeView.mainLayer.canvas.ownerDocument.exitPointerLock
    ).toHaveBeenCalled()
  })

  it('allows further callback execution if there was not enough movement', () => {
    const context = new FakeContext()
    setupPrimaryButtonPanning(context as unknown as ToolContext)

    const event = leftMouseDown()

    context.editor.onMouseDownCallbacks.call(event)

    const spy = jest.fn()
    context.editor.onMouseUpCallbacks.add(spy)
    context.editor.onMouseUpCallbacks.call(event)

    expect(spy).toHaveBeenCalled()
  })

  it('stops further callback execution if there was enough movement', () => {
    const context = new FakeContext()
    setupPrimaryButtonPanning(context as unknown as ToolContext)

    const spy = jest.fn()
    const event = leftMouseDown()

    context.editor.onMouseDownCallbacks.call(event)

    const getOffsetSpy =
      jest.spyOn(context.editor.camera, 'getOffset').mockReturnValue(new Point({ x: 500, y: 500 }))

    context.editor.onMouseUpCallbacks.add(spy)
    context.editor.onMouseUpCallbacks.call(event)

    expect(spy).not.toHaveBeenCalled()

    getOffsetSpy.mockReset()
  })
})
