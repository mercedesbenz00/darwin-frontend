import { EnginePlugin } from '@/engineV2/managers/pluginManagerInterfaces'
import { PluginContext } from '@/engineV2/types'

import { serializer } from './serializer'

interface InferencePlugin extends EnginePlugin {
}

const inferencePlugin: InferencePlugin = {
  activate (context: PluginContext) {
    serializer.context = context

    context.registerSerializer('inference', serializer)
  },
  deactivate (context: PluginContext) {
    context.unregisterSerializer('inference')

    for (const handle of context.handles) {
      handle.release()
    }
  }
}

export default inferencePlugin
