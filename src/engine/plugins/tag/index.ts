import { PluginContext } from '@/engine/editor'
import { EnginePlugin } from '@/engine/managers'

import { serializer } from './serializer'

const tag: EnginePlugin = {
  activate (context: PluginContext) {
    context.registerSerializer('tag', serializer)
  },

  deactivate (context: PluginContext) {
    context.unregisterSerializer('tag')

    context.handles.forEach(h => h.release())
  }
}

export default tag
