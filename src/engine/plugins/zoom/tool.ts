import { EditorCursor } from '@/engine/EditorCursor'
import { Tool, ToolContext } from '@/engine/managers'
import {
  setupTouchPanning,
  setupWASDPanning,
  setupWheelPanning,
  setupZoom
} from '@/engine/plugins/mixins'
import { euclideanDistance } from '@/engineCommon/algebra'
import { CallbackStatus } from '@/engineCommon/callbackHandler'
import { CanvasPoint } from '@/engineCommon/point'
import { isLeftMouseButton } from '@/utils/mouse'
import { CanvasEvent, resolveEventPoint } from '@/utils/touch'

interface ZoomTool extends Tool {
  initialPoint?: CanvasPoint
  cursorPoint?: CanvasPoint
  zoomOut: boolean

  onStart (context: ToolContext, event: CanvasEvent): void
  onMove (context: ToolContext, event: CanvasEvent): void
  onEnd (context: ToolContext, event: CanvasEvent): void
}

export const tool: ZoomTool = {
  initialPoint: undefined,
  cursorPoint: undefined,
  zoomOut: false,

  onStart (context: ToolContext, event: CanvasEvent) {
    const point = resolveEventPoint(event)
    if (!point) { return }

    this.initialPoint = point
    context.editor.activeView.annotationsLayer.changed()
  },

  onMove (context: ToolContext, event: CanvasEvent) {
    const point = resolveEventPoint(event)
    if (!point) { return }

    if (this.initialPoint) {
      this.cursorPoint = point
      context.editor.activeView.annotationsLayer.changed()
      return CallbackStatus.Stop
    }
  },

  onEnd (context: ToolContext, event: CanvasEvent) {
    const point = resolveEventPoint(event, true)

    if (point) {
      this.cursorPoint = point
    }

    if (!this.cursorPoint) { return }

    if (this.initialPoint && euclideanDistance(this.initialPoint, this.cursorPoint) > 0) {
      if (this.zoomOut) {
        const center = this.initialPoint.add(this.cursorPoint).div(2)
        context.editor.camera.zoomOut(center)
      } else {
        context.editor.camera.zoomToBox(this.initialPoint, this.cursorPoint)
      }
    } else {
      if (this.zoomOut) {
        context.editor.camera.zoomOut(this.cursorPoint)
      } else {
        context.editor.camera.zoomIn(this.cursorPoint)
      }
    }
    this.reset(context)

    context.editor.activeView.allLayersChanged()
  },

  activate (context: ToolContext) {
    setupWheelPanning(context)
    setupTouchPanning(context)
    setupWASDPanning(context)
    setupZoom(context)

    context.editor.selectCursor(this.zoomOut ? EditorCursor.ZoomOut : EditorCursor.ZoomIn)

    context.editor.registerCommand('zoom_tool.cancel', () => {
      this.reset(context)
      context.editor.activeView.annotationsLayer.changed()
    })

    context.handles.push(...context.editor.onKeyDown((event) => {
      this.zoomOut = event.shiftKey || event.altKey
      context.editor.selectCursor(this.zoomOut ? EditorCursor.ZoomOut : EditorCursor.ZoomIn)
    }))

    context.handles.push(...context.editor.onKeyUp((event) => {
      this.zoomOut = event.shiftKey || event.altKey
      context.editor.selectCursor(this.zoomOut ? EditorCursor.ZoomOut : EditorCursor.ZoomIn)
      context.editor.activeView.allLayersChanged()
    }))

    context.handles.push(...context.editor.onMouseDown(e => {
      if (!isLeftMouseButton(e)) { return CallbackStatus.Continue }
      return this.onStart(context, e)
    }))
    context.handles.push(...context.editor.onMouseMove(event => this.onMove(context, event)))
    context.handles.push(...context.editor.onMouseUp(event => this.onEnd(context, event)))

    context.handles.push(...context.editor.onTouchStart(event => this.onStart(context, event)))
    context.handles.push(...context.editor.onTouchMove(event => this.onMove(context, event)))
    context.handles.push(...context.editor.onTouchEnd(event => this.onEnd(context, event)))

    const viewsOnRender = context.editor.viewsList.map(view =>
      view.renderManager.onRender((view) => {
        if (!this.cursorPoint || !this.initialPoint) { return }
        const ctx = view.annotationsLayer.context
        if (!ctx) { return }
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 2
        ctx.strokeRect(this.initialPoint.x, this.initialPoint.y,
          this.cursorPoint.x - this.initialPoint.x, this.cursorPoint.y - this.initialPoint.y)
      })
    )

    context.handles.push(...viewsOnRender)
  },
  deactivate () { },
  reset () {
    this.initialPoint = undefined
  }
}
