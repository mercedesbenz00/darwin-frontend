import { PluginContext } from '@/engine/editor'
import { EnginePlugin } from '@/engine/managers'
import { CanvasPoint, Point } from '@/engineCommon/point'

import { tool } from './tool'

interface ZoomPlugin extends EnginePlugin {
  cursorPoint?: CanvasPoint;
}

const zoomPlugin: ZoomPlugin = {
  cursorPoint: undefined,
  activate (context: PluginContext) {
    context.registerTool('zoom_tool', tool)

    context.editor.onMouseMove((event) => {
      this.cursorPoint = new Point({ x: event.offsetX, y: event.offsetY })
    })
    context.registerCommand('zoom.reset', () => {
      context.editor.scaleToFit()
    })
    context.registerCommand('zoom.in', () => {
      if (this.cursorPoint) {
        context.editor.camera.zoomIn(this.cursorPoint)
        context.editor.activeView.allLayersChanged()
      }
    })
    context.registerCommand('zoom.out', () => {
      if (this.cursorPoint) {
        context.editor.camera.zoomOut(this.cursorPoint)
        context.editor.activeView.allLayersChanged()
      }
    })
  },

  deactivate (context: PluginContext) {
    for (const handle of context.handles) {
      handle.release()
    }
  }
}

export default zoomPlugin
