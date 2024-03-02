import { Range } from '@/engineV2/models/layers/types'

export type PolygonToRasterResult = {
  data: number[]
  coords: Range
  boundingBox: {
    x: number,
    y: number,
    w: number,
    h: number,
  }
}

/**
 * Returns true if a point is inside the given polygon.
 *
 * Note: X and Y here are cached seperately rather than
 * using a point-like {x,y} object for performance reasons.
 *
 * @param px x position of point to check
 * @param py y position of point to check
 * @param polygon An array of { x, y } points comprising a polygon.
 *
 * @returns true if the point is inside the polygon
 */
function isPointInsidePolygon (px: number, py: number, polygon: {x: number, y: number}[]): boolean {
  let isInside = false
  let j = polygon.length - 1
  for (let i = 0; i < polygon.length; i++) {
    const polygonI = polygon[i]
    const polygonJ = polygon[j]
    if (
      // Check if line segment's height encapsulates y point.
      (polygonI.y > py) !== (polygonJ.y > py) &&
      // Checks if a ray cast to the right crosses the line segment (given the constraint above).
      px < (polygonJ.x - polygonI.x) * (py - polygonI.y) / (polygonJ.y - polygonI.y) + polygonI.x
    ) {
      isInside = !isInside
    }

    j = i
  }
  return isInside
}

export const polygonToRaster = (
  polygon: {x: number, y: number}[],
  maskWidth: number,
): PolygonToRasterResult => {
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  polygon.forEach(point => {
    const {x, y} = point
    if (minX > x) {
      minX = x
    }
    if (maxX < x) {
      maxX = x
    }
    if (minY > y) {
      minY = y
    }
    if (maxY < y) {
      maxY = y
    }
  })
  minX = Math.floor(minX)
  maxX = Math.floor(maxX)
  minY = Math.ceil(minY)
  maxY = Math.ceil(maxY)

  const indicies: number[] = []
  for (let y = minY; y < maxY; y++) {
    for (let x = minX; x < maxX; x++) {
      const isInside = isPointInsidePolygon(x + 0.5, y + 0.5, polygon)
      if (isInside) {
        indicies.push(y * (maskWidth) + x)
      }
    }
  }
  return {
    data: indicies,
    coords: {
      minX,
      maxX,
      minY,
      maxY
    },
    boundingBox: {
      x: minX,
      y: minY,
      w: maxX - minX,
      h: maxY - minY
    }
  }
}
