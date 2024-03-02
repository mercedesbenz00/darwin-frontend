import { PluginContext } from '@/engine/editor'
import { EnginePlugin } from '@/engine/managers'

interface SaveAnnotationsPlugin extends EnginePlugin {
}

const saveAnnotations: SaveAnnotationsPlugin = {
  activate (context: PluginContext) {
    context.registerCommand('save_annotations.toast', () => {
      if (!context.editor.toast) { return }
      context.editor.toast({ message: 'No need, your work is auto-saved', isError: false })
    })
  },
  deactivate (context: PluginContext) {
    for (const handle of context.handles) {
      handle.release()
    }
  }
}

export default saveAnnotations
