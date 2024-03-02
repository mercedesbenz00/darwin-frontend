import { EnginePlugin } from '@/engineV2/managers/pluginManagerInterfaces'
import { PluginContext } from '@/engineV2/types'
import { VideoView } from '@/engineV2/views'

const videoPlayerPlugin: EnginePlugin = {
  activate (context: PluginContext) {
    context.registerCommand('video_player.play', () => {
      if (context.editor.activeView instanceof VideoView) {
        context.editor.activeView.togglePlayPause()
      }
    })
  },
  deactivate (context: PluginContext) {
    for (const handle of context.handles) {
      handle.release()
    }
  }
}

export default videoPlayerPlugin
