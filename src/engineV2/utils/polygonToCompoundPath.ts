import { CompoundPath } from '@/engineV2/models'
import { Polygon } from '@/engineV2/plugins/polygon/types'

export const polygonToCompoundPath = (polygon: Polygon): CompoundPath => ({
  path: polygon.path,
  additionalPaths: polygon.additionalPaths || []
})
