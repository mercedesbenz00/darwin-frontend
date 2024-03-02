import { PluginContext } from '@/engine/editor'
import { EnginePlugin } from '@/engine/managers'

import { AttributesRenderer } from './AttributesRenderer'
import { overlayer } from './overlayer'
import { serializer } from './serializer'
import { tool } from './tool'

interface AttributesPlugin extends EnginePlugin {
}

const attributesPlugin: AttributesPlugin = {
  activate (context: PluginContext) {
    context.registerAnnotationRenderer('attributes', new AttributesRenderer(context.editor))
    context.registerSerializer('attributes', serializer)
    context.registerTool('attributes_tool', tool)

    context.registerAnnotationOverlayer('attributes', overlayer)
  },
  deactivate (context: PluginContext) {
    context.unregisterAnnotationRenderer('attributes')
    context.unregisterSerializer('attributes')
    context.unregisterTool('attributes_tool')

    context.unregisterAnnotationOverlayer('attributes')

    for (const handle of context.handles) {
      handle.release()
    }
  }
}

export default attributesPlugin
