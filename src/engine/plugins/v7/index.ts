import { PluginContext } from '@/engine/editor'
import { EnginePlugin } from '@/engine/managers'

interface V7Look extends EnginePlugin {
  toggled: boolean
}

const v7Look: V7Look = {
  toggled: false,
  activate (context: PluginContext) {
    context.registerCommand('v7.toggle', () => {
      this.toggled = !this.toggled

      context.editor.camera.lineWidth = this.toggled ? 3 : 1.5
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
