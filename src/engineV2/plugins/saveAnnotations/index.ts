import { EnginePlugin } from '@/engineV2/managers/pluginManagerInterfaces'
import { PluginContext } from '@/engineV2/types'

interface SaveAnnotationsPlugin extends EnginePlugin {
}

const saveAnnotations: SaveAnnotationsPlugin = {
  activate (context: PluginContext) {
    context.registerCommand('save_annotations.toast', () => {
      context.editor.store.dispatch('toast/notify', { content: 'No need, your work is auto-saved' })
    })
  },
  deactivate (context: PluginContext) {
    for (const handle of context.handles) {
      handle.release()
    }
  }
}

export default saveAnnotations
