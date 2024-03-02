import { ImagePoint, Point } from '@/engineCommon/point'

export const calcOuterBoxCentroid = (path: ImagePoint[]): ImagePoint => {
  const minX = Math.min(...path.map(point => point.x))
  const minY = Math.min(...path.map(point => point.y))
  const maxX = Math.max(...path.map(point => point.x))
  const maxY = Math.max(...path.map(point => point.y))
  return new Point<'Image'>({ x: (minX + maxX) / 2, y: (minY + maxY) / 2 })
}
