import { Polygon } from 'polybooljs'

import { ImagePoint } from '@/engineCommon/point'

import { translatePath } from './translatePath'

/**
 * Returns a PolyBool Polygon object, corresponding to a given path,
 * translated by the amount specified by the given point.
 * @param point the translation amount
 * @param path the path to be translated
 */
export const buildBrushTip = (point: ImagePoint, path: number[][]): Polygon => {
  const translatedPath = translatePath(point, path)
  return { regions: [translatedPath], inverted: false }
}
