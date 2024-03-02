import { PluginContext } from '@/engine/editor'
import { EnginePlugin } from '@/engine/managers'
import { resolveTransformedImageData } from '@/engine/utils'
import { CanvasPoint, Point } from '@/engineCommon/point'

import { clamp } from './utils'
interface MangifierGlassPlugin extends EnginePlugin {
  mouse?: CanvasPoint;
  show: boolean;
}

const magnifierGlass: MangifierGlassPlugin = {
  show: false,
  activate (context: PluginContext) {
    context.registerCommand('magnifier_glass.toggle', () => {
      this.show = !this.show
      context.editor.activeView.annotationsLayer.changed()
    })

    context.handles.push(...context.editor.onMouseMove((event) => {
      this.mouse = new Point({ x: event.offsetX, y: event.offsetY }) as CanvasPoint
      if (this.show) {
        context.editor.activeView.annotationsLayer.changed()
      }
    }))

    const viewsOnRender = context.editor.viewsList.map(view =>
      view.renderManager.onRender((view) => {
        if (!this.show) { return }
        if (!this.mouse || !context.editor.activeView.loadedImage) { return }

        const image = context.editor.activeView.loadedImage

        if (!image) { return }
        if (!image.data) { return }

        const ctx = view.annotationsLayer.context
        if (!ctx) { return }

        const { imageFilter } = context.editor.activeView
        const { colorMap, windowLevels } = imageFilter
        const transformedData = resolveTransformedImageData(
          image.data,
          windowLevels,
          colorMap,
          context.editor.activeView.videoMetadata
        )
        if (!transformedData) { return }

        const p = view.camera.canvasViewToImageView(this.mouse)
        const boxSize = 150
        const boxLeft = clamp(this.mouse.x + 75, 0, image.width)
        const boxTop = clamp(this.mouse.y - 75, 0, image.height)

        // clip away everything outside the circle
        ctx.save()
        ctx.beginPath()
        ctx.arc(boxLeft + boxSize / 2, boxTop + boxSize / 2, boxSize / 2, 0, Math.PI * 2, true)
        ctx.closePath()
        ctx.clip()

        ctx.save()
        ctx.imageSmoothingEnabled = false

        ctx.drawImage(
          transformedData,
          p.x - 10,
          p.y - 10,
          20,
          20,
          boxLeft,
          boxTop,
          boxSize,
          boxSize
        )
        ctx.restore()

        // draw white border
        ctx.lineWidth = 4
        ctx.strokeStyle = 'rgb(0, 255, 0)'
        ctx.beginPath()
        ctx.arc(boxLeft + boxSize / 2, boxTop + boxSize / 2, boxSize / 2, 0, Math.PI * 2, true)
        ctx.closePath()
        ctx.stroke()

        // draw point in middle
        ctx.strokeStyle = 'rgb(49, 245, 202)'
        ctx.beginPath()
        ctx.arc(boxLeft + boxSize / 2, boxTop + boxSize / 2, 3.5, 0, 2 * Math.PI)
        ctx.fill()
        ctx.stroke()
        ctx.closePath()
        ctx.restore()
      })
    )

    context.handles.push(...viewsOnRender)
  },
  deactivate (context: PluginContext) {
    for (const handle of context.handles) {
      handle.release()
    }
  }
}

export default magnifierGlass
