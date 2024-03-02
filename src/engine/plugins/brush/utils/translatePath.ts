import { ImagePoint } from '@/engineCommon/point'

/**
 * Translates given path of an amount specified by given point
 * @param point the translation amount
 * @param path the path to be translated
 */
export const translatePath = (point: ImagePoint, path: number[][]): number[][] => {
  return path.map(c => [c[0] + point.x, c[1] + point.y])
}
