import { ImagePoint, Point } from '@/engineCommon/point'

export const calcCentroid = (path: ImagePoint[], scale?: number): ImagePoint => {
  // In the case of keypoints, the centroid is shifted horizontally,
  // so the keypoint itself remains visible
  if (path.length === 1 && scale) {
    return path[0].add(new Point<'Image'>({ x: 25 / scale, y: 0 }))
  }
  // Calculating the centroid of a polygon https://en.wikipedia.org/wiki/Centroid
  let x = 0
  let y = 0
  let area = 0
  for (let i = 0; i < path.length; i++) {
    const c = path[i]
    const n = path[i < path.length - 1 ? i + 1 : 0]
    x += (c.x + n.x) * (c.x * n.y - n.x * c.y)
    y += (c.y + n.y) * (c.x * n.y - n.x * c.y)
    area += (c.x * n.y - n.x * c.y)
  }
  const centroid = new Point<'Image'>({ x, y })
  return centroid.div(3 * area)
}
