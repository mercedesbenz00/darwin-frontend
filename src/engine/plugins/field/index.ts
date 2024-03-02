import { PluginContext } from '@/engine/editor'
import { EnginePlugin } from '@/engine/managers'

import { GraphRenderer } from './graphRenderer'
import { serializer as graphSerializer } from './graphSerializer'
import { serializer as stringSerializer } from './serializer'
import { tool } from './tool'
import { GRAPH_ANNOTATION_TYPE, STRING_ANNOTATION_TYPE } from './types'

const fieldPlugin: EnginePlugin = {
  activate (context: PluginContext) {
    context.registerAnnotationRenderer(GRAPH_ANNOTATION_TYPE, new GraphRenderer(context.editor))
    context.registerSerializer(STRING_ANNOTATION_TYPE, stringSerializer)
    context.registerSerializer(GRAPH_ANNOTATION_TYPE, graphSerializer)
    context.registerTool('field_tool', tool)
  },

  deactivate (context: PluginContext) {
    context.unregisterAnnotationRenderer(GRAPH_ANNOTATION_TYPE)
    context.unregisterSerializer(STRING_ANNOTATION_TYPE)
    context.unregisterSerializer(GRAPH_ANNOTATION_TYPE)
    context.unregisterTool('field_tool')

    for (const handle of context.handles) {
      handle.release()
    }
  }
}

export default fieldPlugin
