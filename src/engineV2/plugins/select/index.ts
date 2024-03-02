import { EnginePlugin } from '@/engineV2/managers/pluginManagerInterfaces'
import { PluginContext } from '@/engineV2/types'

import selectTool from './selectTool'

interface SelectPlugin extends EnginePlugin {
}

const selectPlugin: SelectPlugin = {
  activate (context: PluginContext) {
    context.registerTool('select_tool', selectTool)
  },

  deactivate (context: PluginContext) {
    context.unregisterTool('select_tool')
    for (const handle of context.handles) {
      handle.release()
    }
  }
}

export default selectPlugin
