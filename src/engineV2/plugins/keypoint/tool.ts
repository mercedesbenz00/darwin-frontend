import { CallbackStatus } from '@/engineCommon/callbackHandler'
import { CanvasPoint, ImagePoint, Point } from '@/engineCommon/point'
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

import { annotationType } from './consts'

interface KeypointTool extends Tool {
  point?: ImagePoint
  draw(view: View): void
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
      if (FeatureFlagsManager.isOnLayerV2) {
        this.draw(context.editor.activeView)
      } else {
        context.editor.activeView.annotationsLayer.changed()
      }
    })

    context.handles.push(...context.editor.onMouseMove(event => {
      if (!context.editor.activeView.hitTarget(event)) {
        return CallbackStatus.Stop
      }

      const point = new Point({ x: event.offsetX, y: event.offsetY }) as CanvasPoint
      this.point = context.editor.activeView.camera.canvasViewToImageView(point)
      if (FeatureFlagsManager.isOnLayerV2) {
        this.draw(context.editor.activeView)
      } else {
        context.editor.activeView.annotationsLayer.changed()
      }
    }))

    context.handles.push(...context.editor.onMouseUp(async () => {
      if (!this.point) { return }
      try {
        await context.editor
          .activeView
          .annotationManager
          .createAnnotationAction({
            type: annotationType,
            data: this.point
          })
      } catch (e: unknown) {
        console.error(e)
      }
      if (FeatureFlagsManager.isOnLayerV2) {
        this.draw(context.editor.activeView)
      } else {
        context.editor.activeView.annotationsLayer.changed()
      }
      return CallbackStatus.Stop
    }))

    if (FeatureFlagsManager.isOffLayerV2) {
      const viewsOnRender = context.editor.viewsList.map(view =>
        view.renderManager.onRender((view: View) => {
          const ctx = view.annotationsLayer.context
          if (!ctx || !this.point) { return }
          const point = context.editor.activeView.camera.imageViewToCanvasView(this.point)
          ctx.strokeStyle =
            context.editor.activeView.annotationManager.preselectedAnnotationClassColor()
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
    }
  },
  draw (view: View): void {
    view.annotationsLayer.draw(ctx => {
      if (!ctx || !this.point) { return }
      const point = view.camera.imageViewToCanvasView(this.point)
      ctx.strokeStyle = view.annotationManager.preselectedAnnotationClassColor()
      ctx.fillStyle = 'rgb(255, 255, 255)'
      ctx.lineJoin = 'round'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(point.x, point.y, 3.5, 0, 2 * Math.PI)
      ctx.fill()
      ctx.stroke()
      ctx.closePath()
    })
  },
  deactivate (context: ToolContext): void {
    if (FeatureFlagsManager.isOnLayerV2) {
      context.editor.activeView.annotationsLayer.draw()
    }
  },
  reset () { }
}
