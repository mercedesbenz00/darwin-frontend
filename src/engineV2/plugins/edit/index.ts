import { EditableImagePoint } from '@/engineCommon/point'
import {
  occludeVertexAction,
  removeVertexAction,
  updateAnnotationData
} from '@/engineV2/actions'
import { EnginePlugin } from '@/engineV2/managers/pluginManagerInterfaces'
import { PluginContext } from '@/engineV2/types'

import { tool } from './tool'
import {
  isDeleteVertexContext,
  resolveDeletableVertexContext
} from './utils'

interface EditPlugin extends EnginePlugin {
  onDelete: (context: PluginContext) => void
}

const editPlugin: EditPlugin = {
  activate (context: PluginContext) {
    context.registerCommand('edit.delete', () => this.onDelete(context))
    context.registerTool('edit_tool', tool)
  },

  onDelete (context) {
    const { selectedAnnotation } = context.editor.activeView.annotationManager
    if (!selectedAnnotation) { return }

    // Try to find a path that has a selected vertex
    const deleteContext = resolveDeletableVertexContext(context, selectedAnnotation)
    if (
      deleteContext &&
      isDeleteVertexContext(deleteContext) &&
      selectedAnnotation.type === 'skeleton'
    ) {
      const [path, index] = deleteContext.content
      const action = occludeVertexAction(
        context.editor.activeView,
        selectedAnnotation,
        path,
        index
      )
      context.editor.actionManager.do(action)
    } else if (deleteContext) {
      if (isDeleteVertexContext(deleteContext)) {
        const [path, index] = deleteContext.content
        const action = removeVertexAction(
          context.editor.activeView,
          selectedAnnotation,
          path,
          index
        )
        context.editor.actionManager.do(action)
      } else {
        // Instead of deleting the vertex, we should update the annotation data,
        // since the path where the vertex needs to be deleted from is part of a
        // compound path
        const [paths, pathIndex] = deleteContext.content
        const newPaths: EditableImagePoint[][] = []
        for (let i = 0; i < paths.length; i++) {
          if (i === pathIndex) { continue }
          newPaths.push(paths[i])
        }
        const newData = { path: newPaths[0], additionalPaths: newPaths.slice(1, newPaths.length) }
        const action = updateAnnotationData(
          context.editor.activeView,
          selectedAnnotation,
          selectedAnnotation.data,
          newData
        )
        context.editor.actionManager.do(action)
      }
    } else {
      context.editor
        .activeView
        .annotationManager
        .deleteAnnotationAction(selectedAnnotation)
    }
  },

  deactivate (context: PluginContext) {
    context.unregisterCommand('edit.delete')
    context.unregisterTool('edit_tool')
    for (const handle of context.handles) {
      handle.release()
    }
  }
}

export default editPlugin
