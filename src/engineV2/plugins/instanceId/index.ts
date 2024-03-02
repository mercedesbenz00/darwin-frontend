import { EnginePlugin } from '@/engineV2/managers/pluginManagerInterfaces'
import { PluginContext } from '@/engineV2/types'

import { InstanceIDRenderer } from './InstanceIdRenderer'
import { overlayer } from './overlayer'
import { serializer } from './serializer'
import { tool } from './tool'

interface InstanceIDPlugin extends EnginePlugin {
}

const instanceIDPlugin: InstanceIDPlugin = {
  activate (context: PluginContext) {
    context.registerAnnotationRenderer('instance_id', new InstanceIDRenderer(context.editor))
    context.registerSerializer('instance_id', serializer)
    context.registerTool('instance_id_tool', tool)

    context.registerAnnotationOverlayer('instance_id', overlayer)
  },
  deactivate (context: PluginContext) {
    context.unregisterAnnotationRenderer('instance_id')
    context.unregisterSerializer('instance_id')
    context.unregisterTool('instance_id_tool')
    context.unregisterAnnotationOverlayer('instance_id')
    for (const handle of context.handles) {
      handle.release()
    }
  }
}

export default instanceIDPlugin
