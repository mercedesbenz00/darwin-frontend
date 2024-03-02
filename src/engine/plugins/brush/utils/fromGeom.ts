import Polybooljs from 'polybooljs'
import { MultiPolygon } from 'polygon-clipping'

import { CompoundPath } from '@/engine/models'
import { EditablePoint } from '@/engineCommon/point'

/**
 * Converts a Geom to a CompoundPath
 * @param polygons the MultiPolygon object to be converted
 */
export const fromGeom = (polygons: MultiPolygon): CompoundPath => {
  const [path, ...additionalPaths] = Polybooljs.polygonFromGeoJSON({
    type: 'MultiPolygon',
    coordinates: polygons
  }).regions
    .filter(path => path.length >= 3)
    .map(path => path.map(coord => new EditablePoint<'Image'>({ x: coord[0], y: coord[1] })))

  if (!path) { return { path: [], additionalPaths: [] } }
  return { path, additionalPaths }
}
