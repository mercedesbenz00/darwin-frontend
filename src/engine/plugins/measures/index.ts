import { PluginContext } from '@/engine/editor'
import { EnginePlugin } from '@/engine/managers'

import { serializer } from './serializer'

interface MeasuresPlugin extends EnginePlugin {
}

const measuresPlugin: MeasuresPlugin = {
  activate (context: PluginContext) {
    serializer.context = context

    context.registerSerializer('measures', serializer)
  },
  deactivate (context: PluginContext) {
    context.unregisterSerializer('measures')

    for (const handle of context.handles) {
      handle.release()
    }
  }
}

export default measuresPlugin
