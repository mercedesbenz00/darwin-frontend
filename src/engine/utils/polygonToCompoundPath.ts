import { CompoundPath } from '@/engine/models'
import { Polygon } from '@/engine/plugins/polygon/types'

export const polygonToCompoundPath = (polygon: Polygon): CompoundPath => ({
  path: polygon.path,
  additionalPaths: polygon.additionalPaths || []
})
