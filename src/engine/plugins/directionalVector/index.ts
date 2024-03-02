import { PluginContext } from '@/engine/editor'
import { EnginePlugin } from '@/engine/managers'

import { DirectionalVectorRenderer } from './DirectionalVectorRenderer'
import { serializer } from './serializer'
import { tool } from './tool'

interface DirectionalVectorPlugin extends EnginePlugin {
}

const directionalVector: DirectionalVectorPlugin = {
  activate (context: PluginContext) {
    const renderer = new DirectionalVectorRenderer(context.editor)
    context.registerAnnotationRenderer('directional_vector', renderer)
    context.registerSerializer('directional_vector', serializer)
    context.registerTool('directional_vector_tool', tool)
  },
  deactivate (context: PluginContext) {
    context.unregisterAnnotationRenderer('directional_vector')
    context.unregisterSerializer('directional_vector')
    context.unregisterTool('directional_vector_tool')

    for (const handle of context.handles) {
      handle.release()
    }
  }
}

export default directionalVector
