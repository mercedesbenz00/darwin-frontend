import Polybooljs from 'polybooljs'
import { MultiPolygon } from 'polygon-clipping'

import { CompoundPath } from '@/engineV2/models'

/**
 * Converts a CompoundPath to a Geom
 * @param compoundPath the CompoundPath object to be converted
 */
export const toGeom = (compoundPath: CompoundPath): MultiPolygon => {
  const { path, additionalPaths } = compoundPath
  const paths = additionalPaths ? [path, ...additionalPaths] : [path]

  const res = Polybooljs.polygonToGeoJSON({
    regions: paths.map(path =>
      path.map(point =>
        [point.x, point.y]
      )
    ),
    inverted: false
  }).coordinates

  return Number.isFinite(res?.[0]?.[0]?.[0]) ? [res] : res
}
