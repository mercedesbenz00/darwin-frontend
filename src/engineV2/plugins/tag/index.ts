import { EnginePlugin } from '@/engineV2/managers/pluginManagerInterfaces'
import { PluginContext } from '@/engineV2/types'

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
