import { interpolateBetweenPoints } from '@/engine/plugins/polygon/utils/interpolateBetweenPoints'
import { Point } from '@/engineCommon/point'

it('returns all points between two points, normalized as the normalizationFactor parameter specifies', () => {
  const initialPoint = new Point<'Image'>({ x: 0, y: 0 })
  const finalPoint = new Point<'Image'>({ x: 10, y: 0 })

  const expectedPoints = [
    new Point<'Image'>({ x: 1, y: 0 }),
    new Point<'Image'>({ x: 2, y: 0 }),
    new Point<'Image'>({ x: 3, y: 0 }),
    new Point<'Image'>({ x: 4, y: 0 }),
    new Point<'Image'>({ x: 5, y: 0 }),
    new Point<'Image'>({ x: 6, y: 0 }),
    new Point<'Image'>({ x: 7, y: 0 }),
    new Point<'Image'>({ x: 8, y: 0 }),
    new Point<'Image'>({ x: 9, y: 0 })
  ]

  expect(interpolateBetweenPoints(initialPoint, finalPoint, 1)).toEqual(expectedPoints)
})

it('starts from initialPoint and ends at finalPoint (order matters)', () => {
  const initialPoint = new Point<'Image'>({ x: 10, y: 0 })
  const finalPoint = new Point<'Image'>({ x: 0, y: 0 })

  const expectedPoints = [
    new Point<'Image'>({ x: 9, y: 0 }),
    new Point<'Image'>({ x: 8, y: 0 }),
    new Point<'Image'>({ x: 7, y: 0 }),
    new Point<'Image'>({ x: 6, y: 0 }),
    new Point<'Image'>({ x: 5, y: 0 }),
    new Point<'Image'>({ x: 4, y: 0 }),
    new Point<'Image'>({ x: 3, y: 0 }),
    new Point<'Image'>({ x: 2, y: 0 }),
    new Point<'Image'>({ x: 1, y: 0 })
  ]

  expect(interpolateBetweenPoints(initialPoint, finalPoint, 1)).toEqual(expectedPoints)
})
