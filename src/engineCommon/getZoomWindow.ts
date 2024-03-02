import { EditablePoint, Point } from '@/engineCommon/point'

/**
 * Return the zoom window of a path after applying some padding percentage
 */
export const getZoomWindow = <T>(
  vertices: EditablePoint<T>[],
  width: number,
  height: number,
  paddingPercentage: number = 0.1
): { topLeft: Point<T>, bottomRight: Point<T> } => {
  let minX = vertices[0].x
  let minY = vertices[0].y
  let maxX = vertices[0].x
  let maxY = vertices[0].y

  vertices.forEach(vertex => {
    minX = Math.min(minX, vertex.x)
    minY = Math.min(minY, vertex.y)
    maxX = Math.max(maxX, vertex.x)
    maxY = Math.max(maxY, vertex.y)
  })

  const xDelta = Math.min(width * paddingPercentage, Math.abs(maxX- minX) * 5)
  const yDelta = Math.min(height * paddingPercentage, Math.abs(maxY - minY) * 5)

  minX = minX - xDelta
  minY = minY - yDelta
  maxX = maxX + xDelta
  maxY = maxY + yDelta

  return {
    topLeft: new Point({ x: minX, y: minY }),
    bottomRight: new Point({ x: maxX, y: maxY })
  }
}
