// simple local type, to avoid circular dependencies
type PointLike = { x: number, y: number }

export const euclideanDistance = (point1: PointLike, point2: PointLike): number => {
  const x = point1.x - point2.x
  const y = point1.y - point2.y
  return Math.sqrt(x * x + y * y)
}
