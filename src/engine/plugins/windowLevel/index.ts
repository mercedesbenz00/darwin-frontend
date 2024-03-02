import { PluginContext } from '@/engine/editor'
import { EnginePlugin } from '@/engine/managers'
import { View } from '@/engine/models'
import { refineWindowLevels } from '@/engine/utils'
import { CallbackStatus } from '@/engineCommon/callbackHandler'
import { WindowLevels } from '@/engineCommon/imageManipulation'
import { CanvasPoint, Point } from '@/engineCommon/point'

const hasPointerLockSupport = !!document.exitPointerLock

const ACTIVATE_DELAY = 100
export interface WindowLevelPlugin extends EnginePlugin {
  previousPoint?: CanvasPoint;
  cursorPoint?: CanvasPoint;
  active?: boolean;
  activatedTime?: Date;
  updateWindowLevel(view: View, xOffset: number, yOffset: number): void;
}

const windowLevelPlugin: WindowLevelPlugin = {
  previousPoint: undefined,
  cursorPoint: undefined,
  active: false,
  activatedTime: undefined,
  updateWindowLevel (view: View, xOffset: number, yOffset: number) {
    const { imageFilter, videoMetadata } = view
    const { windowLevels } = imageFilter

    const colorspace = videoMetadata && videoMetadata.colorspace
    const sensitivity = colorspace === 'RG16' ? 80 : 5
    const lowValueOffset = (xOffset + yOffset) * sensitivity
    const highValueOffset = (yOffset - xOffset) * sensitivity

    const newWindowLevels: WindowLevels = [
      refineWindowLevels(Math.floor(windowLevels[0] + lowValueOffset), colorspace),
      refineWindowLevels(Math.floor(windowLevels[1] + highValueOffset), colorspace)
    ]
    newWindowLevels.sort((a, b) => a - b)

    imageFilter.windowLevels = newWindowLevels
    view.setImageFilter(imageFilter)
  },
  activate (context: PluginContext) {
    context.handles.push(...context.editor.onMouseMove((event) => {
      if (!this.active) { return }

      const x = hasPointerLockSupport ? event.movementX : event.offsetX
      const y = hasPointerLockSupport ? event.movementY : event.offsetY
      if (!this.previousPoint) {
        this.previousPoint = new Point({ x, y })
        return CallbackStatus.Stop
      }

      this.cursorPoint = new Point({ x, y })
      if (
        (this.cursorPoint.x - this.previousPoint.x) !== 0 ||
        (this.cursorPoint.y - this.previousPoint.y) !== 0
      ) {
        const xOffset = hasPointerLockSupport
          ? this.cursorPoint.x
          : this.cursorPoint.x - this.previousPoint.x
        const yOffset = hasPointerLockSupport
          ? this.cursorPoint.y
          : this.cursorPoint.y - this.previousPoint.y
        this.updateWindowLevel(context.editor.activeView, xOffset, yOffset)
      }

      this.previousPoint = new Point({ x, y })
      return CallbackStatus.Stop
    }))

    context.registerCommand('window_level.activate', () => {
      // NOTE:
      // Need to apply the delay before activating window_level plugin
      // because the same `Tab` handler exists to move to next/previous annotation.
      // After you press Tab for more than ACTIVATE_DELAY milliseconds,
      // it should activate plugin.
      // Before that, it should activate moving next/previous annotations.
      if (!this.activatedTime) {
        this.activatedTime = new Date()
      } else if (this.activatedTime.getTime() + ACTIVATE_DELAY <= new Date().getTime()) {
        this.active = true
        context.editor.activeView.mainLayer.changed()
        if (context.editor.activeView && hasPointerLockSupport) {
          context.editor.activeView.mainLayer.canvas.requestPointerLock()
        }
      }
    })

    context.registerCommand('window_level.deactivate', () => {
      if (hasPointerLockSupport) {
        document.exitPointerLock()
      }
      this.active = false
      this.previousPoint = undefined
      this.activatedTime = undefined
      context.editor.activeView.mainLayer.changed()
    })
  },

  deactivate (context: PluginContext) {
    for (const handle of context.handles) {
      handle.release()
    }
  }
}

export default windowLevelPlugin
