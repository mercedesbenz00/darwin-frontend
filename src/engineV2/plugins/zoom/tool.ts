import { euclideanDistance } from '@/engineCommon/algebra'
import { CallbackStatus } from '@/engineCommon/callbackHandler'
import { CanvasPoint } from '@/engineCommon/point'
import { EditorCursor } from '@/engineV2/EditorCursor'
import { Tool, ToolContext } from '@/engineV2/managers'
import { FeatureFlagsManager } from '@/engineV2/managers/featureFlagsManager'
import {
  setupTouchPanning,
  setupWASDPanning,
  setupWheelPanning,
  setupZoom
} from '@/engineV2/plugins/mixins'
import { View } from '@/engineV2/views'
import { isLeftMouseButton } from '@/utils/mouse'
import { CanvasEvent, resolveEventPoint } from '@/utils/touch'

interface ZoomTool extends Tool {
  initialPoint?: CanvasPoint
  cursorPoint?: CanvasPoint
  zoomOut: boolean

  onStart (context: ToolContext, event: CanvasEvent): void
  onMove (context: ToolContext, event: CanvasEvent): void
  onEnd (context: ToolContext, event: CanvasEvent): void
  draw (view: View): void
}

export const tool: ZoomTool = {
  initialPoint: undefined,
  cursorPoint: undefined,
  zoomOut: false,

  onStart (context: ToolContext, event: CanvasEvent) {
    const point = resolveEventPoint(event)
    if (!point) { return }

    this.initialPoint = point
    if (FeatureFlagsManager.isOnLayerV2) {
      this.draw(context.editor.activeView)
    } else {
      context.editor.activeView.annotationsLayer.changed()
    }
  },

  onMove (context: ToolContext, event: CanvasEvent) {
    const point = resolveEventPoint(event)
    if (!point) { return }

    if (this.initialPoint) {
      this.cursorPoint = point
      if (FeatureFlagsManager.isOnLayerV2) {
        this.draw(context.editor.activeView)
      } else {
        context.editor.activeView.annotationsLayer.changed()
      }
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
        context.editor.activeView.camera.zoomOut(center)
      } else {
        context.editor.activeView.camera.zoomToBox(this.initialPoint, this.cursorPoint)
      }
    } else {
      if (this.zoomOut) {
        context.editor.activeView.camera.zoomOut(this.cursorPoint)
      } else {
        context.editor.activeView.camera.zoomIn(this.cursorPoint)
      }
    }
    this.reset(context)

    if (FeatureFlagsManager.isOnLayerV2) {
      context.editor.activeView.annotationsLayer.draw()
    }
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
      if (FeatureFlagsManager.isOnLayerV2) {
        this.draw(context.editor.activeView)
      } else {
        context.editor.activeView.annotationsLayer.changed()
      }
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

    if (FeatureFlagsManager.isOffLayerV2) {
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
    }
  },

  draw (view: View): void {
    view.annotationsLayer.draw(ctx => {
      if (!this.cursorPoint || !this.initialPoint) { return }
      if (!ctx) { return }
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      ctx.strokeRect(
        this.initialPoint.x,
        this.initialPoint.y,
        this.cursorPoint.x - this.initialPoint.x,
        this.cursorPoint.y - this.initialPoint.y
      )
    })
  },

  deactivate (context: ToolContext): void {
    if (FeatureFlagsManager.isOnLayerV2) {
      context.editor.activeView.annotationsLayer.draw()
    }
  },

  reset (): void {
    this.initialPoint = undefined
    this.cursorPoint = undefined
  }
}
