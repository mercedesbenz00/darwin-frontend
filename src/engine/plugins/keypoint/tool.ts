import { EditorCursor } from '@/engine/EditorCursor'
import { Tool, ToolContext } from '@/engine/managers'
import { IView } from '@/engine/models/views/types'
import {
  setupTouchPanning,
  setupWASDPanning,
  setupWheelPanning,
  setupZoom
} from '@/engine/plugins/mixins'
import { CallbackStatus } from '@/engineCommon/callbackHandler'
import { CanvasPoint, ImagePoint, Point } from '@/engineCommon/point'
import { isLeftMouseButton } from '@/utils/mouse'

import { annotationType } from './consts'

interface KeypointTool extends Tool {
  point?: ImagePoint
}

export const tool: KeypointTool = {
  point: undefined,

  activate (context: ToolContext) {
    setupWheelPanning(context)
    setupTouchPanning(context)
    setupWASDPanning(context)
    setupZoom(context)

    context.editor.selectCursor(EditorCursor.Draw)

    context.editor.registerCommand('keypoint_tool.cancel', () => {
      this.point = undefined
      context.editor.activeView.annotationsLayer.changed()
    })

    context.handles.push(...context.editor.onMouseMove(event => {
      if (!context.editor.activeView.hitTarget(event)) {
        return CallbackStatus.Stop
      }

      const point = new Point({ x: event.offsetX, y: event.offsetY }) as CanvasPoint
      this.point = context.editor.camera.canvasViewToImageView(point)
      context.editor.activeView.annotationsLayer.changed()
    }))

    context.handles.push(...context.editor.onMouseUp(async (e) => {
      if (!isLeftMouseButton(e)) { return CallbackStatus.Continue }
      if (!this.point) { return }
      await context.editor.activeView.createAnnotation({ type: annotationType, data: this.point })
      context.editor.activeView.annotationsLayer.changed()
      return CallbackStatus.Stop
    }))

    const viewsOnRender = context.editor.viewsList.map(view =>
      view.renderManager.onRender((view: IView) => {
        const ctx = view.annotationsLayer.context
        if (!ctx || !this.point) { return }
        const point = context.editor.camera.imageViewToCanvasView(this.point)
        ctx.strokeStyle = context.editor.preselectedAnnotationClassColor()
        ctx.fillStyle = 'rgb(255, 255, 255)'
        ctx.lineJoin = 'round'
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.arc(point.x, point.y, 3.5, 0, 2 * Math.PI)
        ctx.fill()
        ctx.stroke()
        ctx.closePath()
      })
    )

    context.handles.push(...viewsOnRender)
  },
  deactivate () { },
  reset () { }
}
