import { Polygon } from 'polybooljs'

import { EditablePoint } from '@/engineCommon/point'
import { CompoundPath } from '@/engineV2/models'

/**
 * Converts a PolyBool Polygon to a CompoundPath
 * @param polyBoolPolygon the Polygon object to be converted
 */
export const fromPolyBool = (polyBoolPolygon: Polygon): CompoundPath => {
  const [path, ...additionalPaths] = polyBoolPolygon.regions
    .filter(path => path.length >= 3)
    .map(path => path.map(coord => new EditablePoint<'Image'>({ x: coord[0], y: coord[1] })))

  if (!path) { return { path: [], additionalPaths: [] } }
  return { path, additionalPaths }
}
