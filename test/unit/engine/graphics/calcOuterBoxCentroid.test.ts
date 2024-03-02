import { calcOuterBoxCentroid } from '@/engine/graphics/calcOuterBoxCentroid'
import { IPoint, Point } from '@/engineCommon/point'

describe('calcOuterBoxCentroid', () => {
  const point = (raw: IPoint) => new Point<'Image'>({ x: raw.x, y: raw.y })

  const rawData: { path: IPoint[], centroid: IPoint }[] = [
    {
      path: [{ x: 0, y: 0 }, { x: 0, y: 50 }, { x: 50, y: 50 }, { x: 50, y: 0 }],
      centroid: { x: 25, y: 25 }
    },

    {
      path: [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }],
      centroid: { x: 0, y: 0 }
    }
  ]

  it('works', () => {
    rawData.forEach(({ path, centroid }) =>
      expect(calcOuterBoxCentroid(path.map(point))).toEqual(point(centroid))
    )
  })
})
