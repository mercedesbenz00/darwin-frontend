import { euclideanDistance } from '@/engineCommon/algebra'
import { ImagePoint } from '@/engineCommon/point'

/**
 * Calculates the bounding box of an ellipsis
 */
export const getEllipseBoundingBox = (
  center: ImagePoint,
  top: ImagePoint,
  right: ImagePoint
): { x: number, y: number, w: number, h: number } => {
  const angle = Math.atan2(right.y - center.y, right.x - center.x)
  const angle90 = angle + Math.PI / 2
  const rx = euclideanDistance(center, right)
  const ry = euclideanDistance(center, top)
  const ux = rx * Math.cos(angle)
  const uy = rx * Math.sin(angle)
  const vx = ry * Math.cos(angle90)
  const vy = ry * Math.sin(angle90)

  const w = Math.sqrt(ux * ux + vx * vx) * 2
  const h = Math.sqrt(uy * uy + vy * vy) * 2
  const x = center.x - w / 2
  const y = center.y - h / 2

  return { x, y, w, h }
}
