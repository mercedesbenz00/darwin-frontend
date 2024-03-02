import { Camera } from '@/engineCommon/camera'

import { ImagePoint, Point } from './point'

let camera: Camera
let image: { width: number, height: number }

beforeEach(() => {
  camera = new Camera()
  image = {
    width: 1920,
    height: 1080
  }
  camera.setImage(image)
})

test('canvas to annotation to canvas is the same', () => {
  const canvasPoint = new Point<'Canvas'>({ x: 3, y: 5 })
  const imagePoint = camera.canvasViewToImageView(canvasPoint)
  const canvasPoint2 = camera.imageViewToCanvasView(imagePoint)
  expect(canvasPoint.x).toBeCloseTo(canvasPoint2.x)
  expect(canvasPoint.y).toBeCloseTo(canvasPoint2.y)
})

test('annotation to canvas to annotation is the same', () => {
  const imagePoint = new Point<'Image'>({ x: 3, y: 5 })
  const canvasPoint = camera.imageViewToCanvasView(imagePoint)
  const imagePoint2 = camera.canvasViewToImageView(canvasPoint)
  expect(imagePoint.x).toBeCloseTo(imagePoint2.x)
  expect(imagePoint.y).toBeCloseTo(imagePoint2.y)
})

describe('camera.cursorIsClosingPath when scale 1', () => {
  let initialPoint: ImagePoint
  beforeAll(() => {
    initialPoint = new Point<'Image'>({ x: 3, y: 5 })
  })
  test('returns true when cursor on initial point', () => {
    const cursorPoint = camera.imageViewToCanvasView(initialPoint)

    expect(camera.cursorIsClosingPath(cursorPoint, initialPoint)).toBe(true)
  })

  test('returns true when cursor near to initial point', () => {
    const nearPoint = new Point<'Image'>({ x: 9, y: 10 })
    const cursorPoint = camera.imageViewToCanvasView(nearPoint)

    expect(camera.cursorIsClosingPath(cursorPoint, initialPoint)).toBe(true)
  })
})

describe('camera.cursorIsClosingPath when zoomed in', () => {
  let initialPoint: ImagePoint
  beforeAll(() => {
    const p1 = new Point<'Canvas'>({ x: 2, y: 2 })
    const p2 = new Point<'Canvas'>({ x: 7, y: 7 })
    camera.zoomToBox(p1, p2)
    initialPoint = new Point<'Image'>({ x: 9, y: 10 })
  })
  test('returns true when cursor on initial point', () => {
    const cursorPoint = camera.imageViewToCanvasView(initialPoint)

    expect(camera.cursorIsClosingPath(cursorPoint, initialPoint)).toBe(true)
  })

  test('returns true when cursor near to initial point', () => {
    const nearPoint = new Point<'Image'>({ x: 9, y: 10 })
    const cursorPoint = camera.imageViewToCanvasView(nearPoint)

    expect(camera.cursorIsClosingPath(cursorPoint, initialPoint)).toBe(true)
  })
})

describe('camera.canvasViewToImageView', () => {
  test('returns scaled point', () => {
    const canvasWidth = 770
    const canvasHeight = 900
    camera.setWidth(canvasWidth)
    camera.setHeight(canvasHeight)
    const canvasPoint = new Point<'Canvas'>({ x: 10, y: 10 })
    expect(camera.canvasViewToImageView(canvasPoint)).toEqual(
      { x: 19200, y: 19200 }
    )
  })
})
