import { IPoint, Point } from '@/engineCommon/point'
import { InterpolationAlgorithm } from '@/engineV2/utils/interpolate'

export const interpolatePolylineSame = (
  p: number,
  initial: IPoint[],
  final: IPoint[]
): IPoint[] => {
  const res = []
  for (let i = 0; i < initial.length; i++) {
    res.push(
      new Point({
        x: (1 - p) * initial[i].x + p * final[i].x,
        y: (1 - p) * initial[i].y + p * final[i].y
      })
    )
  }
  return res
}

export const interpolatePolylineFixedAlign = (
  p: number,
  initial: IPoint[],
  final: IPoint[],
  resize: (points: IPoint[], scale: number) => IPoint[],
  algorithm: InterpolationAlgorithm
): IPoint[] => {
  const maxSize = Math.max(initial.length, final.length)
  initial = resize(initial, maxSize)
  final = resize(final, maxSize)

  if (!algorithm || algorithm === 'linear-1.0') {
    return interpolatePolylineSame(p, initial, final)
  }

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
  return interpolatePolylineSame(p, shiftedInitial, final)
}

export const interpolateResizePolyline = (path: IPoint[], targetLength: number): IPoint[] => {
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
