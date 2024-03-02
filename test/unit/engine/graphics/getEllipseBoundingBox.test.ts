import { getEllipseBoundingBox } from '@/engine/graphics/getEllipseBoundingBox'
import { Point } from '@/engineCommon/point'

describe('getEllipseBoundingBox', () => {
  it('calculates the bounding box of a circle', () => {
    const center = new Point<'Image'>({ x: 10, y: 10 })
    const top = new Point<'Image'>({ x: 10, y: 0 })
    const right = new Point<'Image'>({ x: 20, y: 10 })

    const { x, y, w, h } = getEllipseBoundingBox(center, top, right)
    expect(x).toEqual(0)
    expect(y).toEqual(0)
    expect(w).toEqual(20)
    expect(h).toEqual(20)
  })

  it('calculates the bounding box of an ellipsis', () => {
    // x-radius: 20, y-radius: 10
    const center = new Point<'Image'>({ x: 20, y: 20 })
    const top = new Point<'Image'>({ x: 20, y: 10 })
    const right = new Point<'Image'>({ x: 40, y: 20 })

    const { x, y, w, h } = getEllipseBoundingBox(center, top, right)
    expect(x).toEqual(0)
    expect(y).toEqual(10)
    expect(w).toEqual(40)
    expect(h).toEqual(20)
  })
})
