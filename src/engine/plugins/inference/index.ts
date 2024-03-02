import { PluginContext } from '@/engine/editor'
import { EnginePlugin } from '@/engine/managers'

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
