import { ImagePoint } from '@/engineCommon/point'

export const calcMiddleSegmentMiddlePoint = (path: ImagePoint[]): ImagePoint => {
  const i = Math.floor(path.length / 2) - 1
  return path[i].add(path[i + 1]).div(2)
}
