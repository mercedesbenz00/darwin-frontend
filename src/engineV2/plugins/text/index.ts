import { EnginePlugin } from '@/engineV2/managers/pluginManagerInterfaces'
import { PluginContext } from '@/engineV2/types'

import { TextRenderer } from './TextRenderer'
import { overlayer } from './overlayer'
import { serializer } from './serializer'
import { tool } from './tool'

export interface TextPlugin extends EnginePlugin {
}

const textPlugin: TextPlugin = {
  activate (context: PluginContext) {
    context.registerAnnotationRenderer('text', new TextRenderer(context.editor))
    context.registerSerializer('text', serializer)
    context.registerTool('text_tool', tool)

    context.registerAnnotationOverlayer('text', overlayer)
  },
  deactivate (context: PluginContext) {
    context.unregisterAnnotationRenderer('text')
    context.unregisterSerializer('text')
    context.unregisterTool('text_tool')

    context.unregisterAnnotationOverlayer('text')
    for (const handle of context.handles) {
      handle.release()
    }
  }
}

export default textPlugin
