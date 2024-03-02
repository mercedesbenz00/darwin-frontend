import { euclideanDistance } from '@/engineCommon/algebra'
import { Point } from '@/engineCommon/point'

export const interpolateBetweenPoints = <T>(
  initialPoint: Point<T>,
  finalPoint: Point<T>,
  interpolationLength: number = 0.2
): Point<T>[] => {
  const interpolatedPoints = []

  const diffVector = finalPoint.sub(initialPoint)
  const norm = euclideanDistance(finalPoint, initialPoint) / interpolationLength
  const normedDiffVector = diffVector.div(norm)

  for (let i = interpolationLength; i < norm; i += interpolationLength) {
    interpolatedPoints.push(initialPoint.add(normedDiffVector.mul(i)))
  }

  return interpolatedPoints
}
