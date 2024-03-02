import { PluginContext } from '@/engine/editor'
import { EnginePlugin } from '@/engine/managers'

const videoPlayerPlugin: EnginePlugin = {
  activate (context: PluginContext) {
    context.registerCommand('video_player.play', () => {
      context.editor.toggleVideo()
    })
  },
  deactivate (context: PluginContext) {
    for (const handle of context.handles) {
      handle.release()
    }
  }
}

export default videoPlayerPlugin
