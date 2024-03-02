import { IPoint, Point } from '@/engineCommon/point'
import { InterpolationAlgorithm } from '@/engineV2/utils/interpolate'

import { interpolatePolygonSame } from './interpolatePolygonSame'

export const interpolatePolygonFixedAlign = (
  p: number,
  initial: IPoint[],
  final: IPoint[],
  resize: any,
  algorithm: InterpolationAlgorithm
): IPoint[] => {
  const maxSize = Math.max(initial.length, final.length)
  initial = resize(initial, maxSize)
  final = resize(final, maxSize)

  if (!algorithm || algorithm === 'linear-1.0') { return interpolatePolygonSame(p, initial, final) }

  let bestShift = 0
  let bestShiftCost = 100000000
  let bestUseReverse = 0
  for (let rev = 0; rev < 2; rev++) {
    for (let shift = 0; shift < initial.length; shift++) {
      let cost = 0
      for (let i = 0; i < initial.length; i++) {
        const j = ((rev === 0 ? i : initial.length - i - 1) + shift) % initial.length
        cost += Math.sqrt((initial[j].x - final[i].x) ** 2 + (initial[j].y - final[i].y) ** 2)
        // early stopping
        if (cost > bestShiftCost) { break }
      }

      if (cost < bestShiftCost) {
        bestShiftCost = cost
        bestShift = shift
        bestUseReverse = rev
      }
    }
  }

  const shiftedInitial = []
  for (let i = 0; i < initial.length; i++) {
    const j = ((bestUseReverse === 0 ? i : initial.length - i - 1) + bestShift) % initial.length
    shiftedInitial.push(new Point(initial[j]))
  }
  return interpolatePolygonSame(p, shiftedInitial, final)
}
