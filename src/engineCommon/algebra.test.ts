import {
  closestCorner,
  dist,
  euclideanDistance,
  intersectsAt,
  maybeSimplifyPolygon,
  pointInRect,
  rectIntersect,
  simplifyPolygon
} from './algebra'

describe('intersectAt', () => {
  it('approximates the result to a point far from the canvas if the lines are parallel', () => {
    expect(intersectsAt(1, 1, 1, 1)).toEqual({ x: -10000, y: -100000 })
  })

  it('computes the intersecting point', () => {
    expect(intersectsAt(1, 1, -1, 1)).toEqual({ x: 0, y: 1 })
  })
})

describe('rectIntersect', () => {
  it('calculates the intersection points of a line with a rectangle', () => {
    const rectangle = {
      top: { x: 0, y: 0 },
      bottom: { x: 10, y: 10 },
      left: { x: 0, y: 0 },
      right: { x: 10, y: 10 }
    }
    expect(rectIntersect(5, 5, 5, 1, 0)).toEqual(rectangle)
  })
})

describe('pointInRect', () => {
  it('returns true if point lies within a rectangle', () => {
    expect(pointInRect(5, 5, 5, { x: 2, y: 8 })).toBeTruthy()
  })

  it('returns false if point lies outside a rectangle', () => {
    expect(pointInRect(5, 5, 5, { x: -2, y: 8 })).toBeFalsy()
  })
})

describe('dist', () => {
  it('computes squared distance of two points', () => {
    expect(dist({ x: 1, y: 1 }, { x: 4, y: 5 })).toEqual(5 * 5)
  })
})

describe('closestCorner', () => {
  it('finds closest corner of a rectangle outscribed in a circle', () => {
    expect(closestCorner(5, 5, 5, { x: 1, y: 1 })).toEqual({ x: 0, y: 0 })
    expect(closestCorner(5, 5, 5, { x: 6, y: 7 })).toEqual({ x: 10, y: 10 })
    expect(closestCorner(5, 5, 5, { x: 1, y: 9 })).toEqual({ x: 0, y: 10 })
    expect(closestCorner(5, 5, 5, { x: 7, y: 3 })).toEqual({ x: 10, y: 0 })
  })
})

describe('euclideanDistance', () => {
  it('computes the euclidean distance between two points', () => {
    const p1 = { x: 0, y: 10 }
    const p2 = { x: 10, y: 5 }
    const dist = euclideanDistance(p1, p2)
    expect(dist).toBe(Math.sqrt(100 + 25))
  })
})

describe('simplifyPolygon', () => {
  it('could generate 2 point paths', () => {
    const path = [
      { x: 825.7471810447838, y: 38.2528189552162 },
      { x: 825.4914740002343, y: 38.2528189552162 },
      { x: 825.4914740002343, y: 38.50852599976566 }
    ]
    expect(simplifyPolygon(path, 0.5).length).toBe(2)
  })
})

describe('maybeSimplifyPolygon', () => {
  it('keeps the original path if the simplified path is made of less than 3 points', () => {
    const path = [
      { x: 825.7471810447838, y: 38.2528189552162 },
      { x: 825.4914740002343, y: 38.2528189552162 },
      { x: 825.4914740002343, y: 38.50852599976566 }
    ]
    expect(maybeSimplifyPolygon(path, 0.5).length).toBe(3)
  })
})
