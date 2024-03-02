import { getZoomWindow } from '@/engineCommon/getZoomWindow'
import { EditablePoint } from '@/engineCommon/point'

it('getZoomWindow calculates zoom properly with 10% of window size', () => {
  const vertices = [
    new EditablePoint({ x: 0, y: 0 }),
    new EditablePoint({ x: 0, y: 10 }),
    new EditablePoint({ x: 10, y: 10 }),
    new EditablePoint({ x: 10, y: 0 })
  ]
  const { topLeft, bottomRight } = getZoomWindow(vertices, 120, 230, 0.1)
  expect(topLeft).toEqual(expect.objectContaining({ x: -12, y: -23 }))
  expect(bottomRight).toEqual(expect.objectContaining({ x: 10 + 12, y: 10 + 23 }))
})

it('getZoomWindow calculates zoom properly with 10 times of annotation size', () => {
  const vertices = [
    new EditablePoint({ x: 0, y: 0 }),
    new EditablePoint({ x: 0, y: 10 }),
    new EditablePoint({ x: 10, y: 10 }),
    new EditablePoint({ x: 10, y: 0 })
  ]
  const { topLeft, bottomRight } = getZoomWindow(vertices, 1200, 2300, 0.1)
  expect(topLeft).toEqual(expect.objectContaining({ x: -50, y: -50 }))
  expect(bottomRight).toEqual(expect.objectContaining({ x: 10 + 50, y: 10 + 50 }))
})
