import { Segment, segments } from 'polybooljs'

import { closestCorner, pointInRect, rectIntersect } from '@/engineCommon/algebra'

/**
 * Interpolate brush stroke when the tip is squared
 * @param p1 initial point
 * @param p2 final point
 * @param r radius of outscribed circle of the brush tip
 */
export const interpolateSquare = (
  p1: { x: number, y: number },
  p2: { x: number, y: number },
  r: number
): Segment => {
  if (p1.x === p2.x) {
    return segments({
      regions: [[
        [p1.x + r, p1.y - r],
        [p2.x - r, p1.y - r],
        [p2.x - r, p2.y + r],
        [p1.x + r, p2.y + r]
      ]],
      inverted: false
    })
  }
  if (p1.y === p2.y) {
    return segments({
      regions: [[
        [p1.x + r, p1.y - r],
        [p2.x - r, p2.y - r],
        [p2.x - r, p2.y + r],
        [p1.x + r, p1.y + r]
      ]],
      inverted: false
    })
  }
  // get vector from p1 to p2 (y=kx+m)
  const p1p2K = (p2.y - p1.y) / (p2.x - p1.x)
  // perpendicular line at the center of each shape
  const p1dK = -1 / p1p2K
  const p1dM = p1.y - p1dK * p1.x
  // find out where the line intersects with the first rectangle
  // the second rectangle is given for free by just adding the vector
  let points1: { x: number, y: number }[]
  const r1 = rectIntersect(p1.x, p1.y, r, p1dK, p1dM)
  // only two of the points will lie on the rectangle
  points1 =
    [r1.top, r1.bottom, r1.left, r1.right].filter((p) => { return pointInRect(p1.x, p1.y, r, p) })
  // to cover the full hull, find the corners closest to the two points
  points1 = points1.map((p) => { return closestCorner(p1.x, p1.y, r, p) })
  // the corner points in the second retangle is done by just adding the p1p2 vector
  const points2: { x: number, y: number }[] =
    points1.map(p => { return { x: p.x + p2.x - p1.x, y: p.y + p2.y - p1.y } })

  return segments({
    regions: [[
      [points1[0].x, points1[0].y],
      [points2[0].x, points2[0].y],
      [points2[1].x, points2[1].y],
      [points1[1].x, points1[1].y]
    ]],
    inverted: false
  })
}
