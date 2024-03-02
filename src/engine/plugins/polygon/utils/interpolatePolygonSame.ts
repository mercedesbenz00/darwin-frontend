import { IPoint, Point } from '@/engineCommon/point'

export const interpolatePolygonSame = (p: number, initial: IPoint[], final: IPoint[]): IPoint[] => {
  const res = []
  for (let i = 0; i < initial.length; i++) {
    res.push(new Point({
      x: (1 - p) * initial[i].x + p * final[i].x,
      y: (1 - p) * initial[i].y + p * final[i].y
    }))
  }
  return res
}
