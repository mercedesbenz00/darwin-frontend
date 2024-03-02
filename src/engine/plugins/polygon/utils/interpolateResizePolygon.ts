import { IPoint, Point } from '@/engineCommon/point'

export const interpolateResizePolygon = (path: IPoint[], targetLength: number): IPoint[] => {
  const res = []
  const additionalPoints = targetLength - path.length
  const indices = []
  for (let i = 0; i < path.length; i++) { indices.push(i) }
  let r = (path.length - 1) / targetLength
  for (let i = 0; i < additionalPoints; i++) {
    indices.push(r)
    r += (path.length - 1) / additionalPoints
  }
  indices.sort((a, b) => a - b)
  for (let i = 0; i < indices.length; i++) {
    const ind = indices[i]
    const aX = path[Math.floor(ind)].x
    const aY = path[Math.floor(ind)].y
    const bX = path[Math.ceil(ind) % path.length].x
    const bY = path[Math.ceil(ind) % path.length].y
    res.push(new Point({
      x: (1 - ind % 1) * aX + (ind % 1) * bX,
      y: (1 - ind % 1) * aY + (ind % 1) * bY
    }))
  }

  return res
}
