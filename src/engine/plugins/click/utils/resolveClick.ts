import { Click } from '@/engineCommon/backend'
import { ImagePoint, pointInPath } from '@/engineCommon/point'

export const resolveClick = (point: ImagePoint, path: ImagePoint[]): Click => {
  const type = pointInPath(point, path) ? 'remove' : 'add'
  return { ...point, type } as Click
}
