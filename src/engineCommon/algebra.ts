// simple private type, to avoid circular dependencies
type PointLike = { x: number, y: number }

export { euclideanDistance } from './algebra/euclideanDistance'

export const intersectsAt = (k1: number, m1: number, k2: number, m2: number): PointLike => {
  // parallel lines do not intersect. we approximate this with a point far from the canvas
  if (k1 === k2) { return { x: -10000, y: -100000 } }
  const x = (m2 - m1) / (k1 - k2)
  const y = k1 * x + m1
  return { x, y }
}

export const rectIntersect = (x: number, y: number, r: number, k: number, m: number): {
  top: PointLike,
  bottom: PointLike,
  left: PointLike,
  right: PointLike
}  => {
  // Y = kX + m intersecting with a rectangle outscribed
  // in a circle centered in (x, y) with radius r
  const top = intersectsAt(k, m, 0, y - r)
  const bottom = intersectsAt(k, m, 0, y + r)
  const left = { x: x - r, y: k * (x - r) + m }
  const right = { x: x + r, y: k * (x + r) + m }
  return { top, bottom, left, right }
}

export const rectIntersect2 =
  (x: number, y: number, rx: number, ry: number, k: number, m: number): PointLike[] => {
    if (!Number.isFinite(m)) {
      return [{ x, y: y - ry }, { x, y: y + ry }]
    }
    const top = intersectsAt(k, m, 0, y - ry)
    const bottom = intersectsAt(k, m, 0, y + ry)
    const left = { x: x - rx, y: k * (x - rx) + m }
    const right = { x: x + rx, y: k * (x + rx) + m }
    return [top, bottom, left, right]
  }

export const pointInRect =
  (x: number, y: number, r: number, point: { x: number, y: number }): boolean => {
    // Need an epsilon value due to floating point issues
    const eps = 0.001
    return (
      point.x + eps >= x - r &&
    point.x - eps <= x + r &&
    point.y + eps >= y - r &&
    point.y - eps <= y + r
    )
  }

export const pointInRect2 =
  (x: number, y: number, rx: number, ry: number, point: { x: number, y: number }): boolean => {
    // Need an epsilon value due to floating point issues
    const eps = 0.001
    return (
      point.x + eps >= x - rx &&
      point.x - eps <= x + rx &&
      point.y + eps >= y - ry &&
      point.y - eps <= y + ry
    )
  }

export const dist = (p1: { x: number, y: number }, p2: { x: number, y: number }): number =>
  (p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y)

export const closestCorner =
  (x: number, y: number, r: number, p: { x: number, y: number }): { x: number, y: number } => {
    const corners = [
      { x: x - r, y: y - r },
      { x: x - r, y: y + r },
      { x: x + r, y: y + r },
      { x: x + r, y: y - r }
    ]
    corners.sort((cp1, cp2) => { return dist(cp1, p) - dist(cp2, p) })
    return corners[0]
  }

export const perpendicularDistance = (p: PointLike, a: PointLike, b: PointLike): number => {
  return (
    Math.abs((b.y - a.y) * p.x - (b.x - a.x) * p.y + b.x * a.y - b.y * a.x) /
    Math.sqrt((b.y - a.y) ** 2 + (b.x - a.x) ** 2)
  )
}

// https://en.wikipedia.org/wiki/Ramer%E2%80%93Douglas%E2%80%93Peucker_algorithm
export const simplifyPolygon = (polygon: PointLike[], epsilon: number): PointLike[] => {
  let dmax = 0
  let index = 0
  const end = polygon.length - 1
  for (let i = 1; i < end; i++) {
    const d = perpendicularDistance(polygon[i], polygon[0], polygon[end])
    if (d > dmax) {
      dmax = d
      index = i
    }
  }
  if (dmax > epsilon) {
    const left = simplifyPolygon(polygon.slice(0, index + 1), epsilon)
    const right = simplifyPolygon(polygon.slice(index, end + 1), epsilon)
    return [...left.slice(0, left.length - 1), ...right]
  }
  return [polygon[0], polygon[end]]
}

export const maybeSimplifyPolygon = (path: PointLike[], epsilon: number): PointLike[] => {
  const simplifiedPath = simplifyPolygon(path, epsilon)
  return simplifiedPath.length > 2 ? simplifiedPath : path
}
