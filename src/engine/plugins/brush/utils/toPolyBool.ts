import { Polygon } from 'polybooljs'

import { CompoundPath } from '@/engine/models'

/**
 * Converts a PolyBool CompoundPath to a Polygon
 * @param compoundPath the CompoundPath object to be converted
 */
export const toPolyBool = (compoundPath: CompoundPath): Polygon => {
  const { path, additionalPaths } = compoundPath
  const paths = additionalPaths ? [path, ...additionalPaths] : [path]
  return {
    regions: paths.map(path => path.map(point => [point.x, point.y])),
    inverted: false
  }
}
