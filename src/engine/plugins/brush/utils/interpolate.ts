import min from 'lodash/min'
import { Segment, segments } from 'polybooljs'

import { euclideanDistance } from '@/engineCommon/algebra'
import { Point } from '@/engineCommon/point'

import { buildRegularPolygonPath } from './buildRegularPolygonPath'
import { getSides } from './getSides'
import { translatePath } from './translatePath'

/**
 * Interpolate brush stroke when the tip is round
 * @param p1 initial point
 * @param p2 final point
 * @param r radius of the brush tip
 */
export const interpolate =
  (p1: { x: number, y: number }, p2: { x: number, y: number }, r: number): Segment => {
    if (p1.x === p2.x) {
      return segments({
        regions: [[
          [p1.x - r, p1.y],
          [p1.x + r, p1.y],
          [p2.x + r, p2.y],
          [p2.x - r, p2.y]
        ]],
        inverted: false
      })
    }
    if (p1.y === p2.y) {
      return segments({
        regions: [[
          [p1.x, p1.y - r],
          [p2.x, p2.y - r],
          [p2.x, p2.y + r],
          [p1.x, p1.y + r]
        ]],
        inverted: false
      })
    }

    const alpha = Math.atan2(p2.y - p1.y, p2.x - p1.x)
    const offsetX = r * Math.cos(Math.PI / 2 + alpha)
    const offsetY = r * Math.sin(Math.PI / 2 + alpha)

    // Build the polygons centered on p1 and p2
    const sides = getSides('round', r)
    const regularPolygonPath = buildRegularPolygonPath(r, sides)
    const poly1 = translatePath(new Point<'Image'>(p1), regularPolygonPath)
    const poly2 = translatePath(new Point<'Image'>(p2), regularPolygonPath)

    // Find the polygon vertices that are closer to the intersection point
    // between their circumscribed circles and the lines perpendicular to the
    // interpolation vector intersecting p1 and p2
    const distances1 = poly1.map(point => euclideanDistance(
      { x: point[0], y: point[1] },
      { x: p1.x - offsetX, y: p1.y - offsetY }
    ))

    const minDistanceIndex1 = distances1.indexOf(min(distances1)!)
    const symDistanceIndex1 = (minDistanceIndex1 + sides / 2) % sides

    const distances2 = poly2.map(point => euclideanDistance(
      new Point<'Image'>({ x: point[0], y: point[1] }),
      new Point<'Image'>({ x: p2.x - offsetX, y: p2.y - offsetY })
    ))
    const minDistanceIndex2 = distances2.indexOf(min(distances2)!)
    const symDistanceIndex2 = (minDistanceIndex2 + sides / 2) % sides

    return segments({
      regions: [[
        poly1[minDistanceIndex1],
        poly2[minDistanceIndex2],
        poly2[symDistanceIndex2],
        poly1[symDistanceIndex1]
      ]],
      inverted: false
    })
  }
