import { EnginePlugin } from '@/engineV2/managers/pluginManagerInterfaces'
import { PluginContext } from '@/engineV2/types'

interface V7Look extends EnginePlugin {
  toggled: boolean
}

const v7Look: V7Look = {
  toggled: false,
  activate (context: PluginContext) {
    context.registerCommand('v7.toggle', () => {
      this.toggled = !this.toggled

      context.editor.activeView.camera.lineWidth = this.toggled ? 3 : 1.5
      context.editor.activeView.showPills = !this.toggled

      context.editor.activeView.allLayersChanged()
    })
  },
  deactivate (context: PluginContext) {
    for (const handle of context.handles) {
      handle.release()
    }
  }
}

export default v7Look
