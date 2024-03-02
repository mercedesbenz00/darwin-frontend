import { CompoundPath } from '@/engineV2/models'
import { DeletableVertexContext } from '@/engineV2/plugins/edit/types'

export const resolvePolygonDeletableVertexContext = (
  compoundPath: CompoundPath
): DeletableVertexContext => {
  // For polygons, search all paths for a selected vertex
  const paths = [compoundPath.path, ...compoundPath.additionalPaths]
  for (let pathIndex = 0; pathIndex < paths.length; pathIndex++) {
    const path = paths[pathIndex]
    const vertexIndex = path.findIndex((p) => p.isSelected)
    if (vertexIndex >= 0) {
      // If we find a selected vertex in a compound path, then we check whether that
      // path is made of 3 points or less, in which case we want to update the annotation data
      // to rebuild the compound path without that inner path
      return path.length <= 3
        ? { action: 'update', content: [paths, pathIndex] }
        : { action: 'deleteVertex', content: [path, vertexIndex] }
    }
  }
  return null
}
