import { isMainAnnotationTypeRenderer } from '@/engineV2/managers'
import { Annotation } from '@/engineV2/models'
import { DeletableVertexContext, EditPluginError } from '@/engineV2/plugins/edit/types'
import { PluginContext } from '@/engineV2/types'

import { resolvePolygonDeletableVertexContext } from './resolvePolygonDeletableVertexContext'

/**
 * Resolves context for a deletable vertex
 * Returning the matched vertex and its index when resolved.
 * Returns null when not resolved
 *
 * TODO: This is a specialized solution specific for polygon types
 * To support other types, we need a generalized solution
 */
export const resolveDeletableVertexContext =
  (context: PluginContext, annotation: Annotation): DeletableVertexContext => {
    const deletionAllowed = ['line', 'polygon', 'skeleton'].includes(annotation.type)
    if (!deletionAllowed) { return null }

    const renderer = context.editor.activeView.renderManager.rendererFor(annotation.type)
    if (!isMainAnnotationTypeRenderer(renderer)) { return null }

    const path = renderer.getPath(annotation, context.editor.activeView)
    if (!path) { return null }

    if (annotation.type === 'polygon') {
      if (!path.path) { return null }
      // The following condition should never be met
      if (path instanceof Array) {
        throw new EditPluginError(
          'Polygon path is encoded as array of paths. Should be an array of points instead'
        )
      }
      return resolvePolygonDeletableVertexContext(path)
    }
    if (annotation.type === 'line') {
      if (!path.path) { return null }
      // The following condition should never be met
      if (!(path.path instanceof Array)) { return null }

      const paths = [path.path]
      for (const path of paths) {
        if (path.length <= 2) { return null }
        const index = path.findIndex((p) => p.isSelected)
        if (index >= 0) {
          return { action: 'deleteVertex', content: [path, index] }
        }
      }
      return null
    }
    // For skeletons, find the selected vertex
    const index = path.path.findIndex((p) => p.isSelected)
    if (index >= 0) { return { action: 'deleteVertex', content: [path.path, index] } }

    return null
  }
