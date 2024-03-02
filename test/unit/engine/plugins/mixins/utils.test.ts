import { touchDistance, touchMiddlePoint } from '@/engine/plugins/mixins/utils'

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

describe('touchMiddlePoint', () => {
  it('returns a point in (0, 0) if no targetTouches detected', () => {
    const event = new TouchEvent('touchstart', { targetTouches: [] })
    expect(touchMiddlePoint(event)).toEqual({ x: 0, y: 0 })
  })

  it('returns the specified point if targetTouches includes only one point', () => {
    const targetTouches = [
      buildTouch({
        clientX: 100,
        clientY: 200
      })
    ]

    const event = new TouchEvent('touchstart', { targetTouches })
    expect(touchMiddlePoint(event)).toEqual({ x: 100, y: 200 })
  })

  it('averages all targetTouches otherwise', () => {
    const targetTouches = [
      buildTouch({
        clientX: 100,
        clientY: 200,
        identifier: 1
      }),
      buildTouch({
        clientX: 800,
        clientY: 300,
        identifier: 2
      }),
      buildTouch({
        clientX: 600,
        clientY: 400,
        identifier: 3
      })
    ]

    const event = new TouchEvent('touchstart', { targetTouches })
    expect(touchMiddlePoint(event)).toEqual({ x: 500, y: 300 })
  })
})

describe('touchDistance', () => {
  it('is undefined when fewer than 2 touches are detected', () => {
    const noTouchEvent = new TouchEvent('touchstart', { targetTouches: [] })
    expect(touchDistance(noTouchEvent)).toBeUndefined()

    const oneTouchEvent = new TouchEvent(
      'touchstart',
      {
        targetTouches: [
          buildTouch({
            clientX: 100,
            clientY: 200
          })
        ]
      }
    )

    expect(touchDistance(oneTouchEvent)).toBeUndefined()
  })

  it('is undefined when more than 2 touches are detected', () => {
    const event = new TouchEvent(
      'touchstart',
      {
        targetTouches: [
          buildTouch({
            clientX: 100,
            clientY: 200,
            identifier: 1
          }),
          buildTouch({
            clientX: 100,
            clientY: 200,
            identifier: 2
          }),
          buildTouch({
            clientX: 100,
            clientY: 200,
            identifier: 3
          })
        ]
      }
    )

    expect(touchDistance(event)).toBeUndefined()
  })

  it('computes the distance between the two points otherwise', () => {
    const event = new TouchEvent(
      'touchstart',
      {
        targetTouches: [
          buildTouch({
            clientX: 100,
            clientY: 200,
            identifier: 1
          }),
          buildTouch({
            clientX: 400,
            clientY: 600,
            identifier: 2
          })
        ]
      }
    )

    expect(touchDistance(event)).toEqual(500)
  })
})
