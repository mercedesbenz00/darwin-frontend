import { PluginContext } from '@/engine/editor'
import { EnginePlugin } from '@/engine/managers'

import { tool } from './tool'

const brush: EnginePlugin = {
  activate (context: PluginContext) {
    context.registerTool('brush_tool', tool)
  },

  deactivate (context: PluginContext) {
    context.unregisterTool('brush_tool')
    for (const handle of context.handles) {
      handle.release()
    }
  }
}

export default brush
