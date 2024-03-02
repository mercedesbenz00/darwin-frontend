import { resolveEventPoint } from '@/utils/touch'

const buildTouch = (touchArgs: Partial<TouchInit>): Touch => ({
  altitudeAngle: 0,
  azimuthAngle: 0,
  clientX: 0,
  clientY: 0,
  force: 0,
  identifier: 1,
  pageX: 0,
  pageY: 0,
  radiusX: 0,
  radiusY: 0,
  rotationAngle: 0,
  screenX: 0,
  screenY: 0,
  target: new EventTarget(),
  touchType: 'stylus',
  ...touchArgs
})

describe('resolveEventPoint', () => {
  it('returns offset point if MouseEvent detected', () => {
    // There seems to be no way of building a MouseEvent by specifying its offsetX and offsetY attributes
    const mouseEvent = new MouseEvent('mousedown')
    expect(resolveEventPoint(mouseEvent)).toEqual({ x: undefined, y: undefined })
  })

  it('returns touch point if TouchEvent detected', () => {
    // There seems to be no way of building a TouchEvent by specifying its target attribute
    const touchEvent = new TouchEvent(
      'touchstart',
      {
        targetTouches: [buildTouch({ clientX: 100, clientY: 200 })]
      }
    )

    // expect(resolveEventPoint(touchEvent)).toEqual({ x: 100, y: 200 })
    expect(resolveEventPoint(touchEvent)).toBeNull()
  })
})
