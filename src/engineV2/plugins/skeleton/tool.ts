import { CallbackStatus } from '@/engineCommon/callbackHandler'
import { CanvasPoint, EditablePoint } from '@/engineCommon/point'
import { EditorCursor } from '@/engineV2/EditorCursor'
import { drawTemporarySkeleton, drawTemporarySkeletonV2 } from '@/engineV2/graphics'
import { drawGuideLines } from '@/engineV2/graphics/drawGuideLines'
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

import { annotationType } from './consts'
import { Skeleton } from './types'

export interface SkeletonTool extends Tool {
  initialPoint?: CanvasPoint,
  cursorPoint?: CanvasPoint,

  onStart: (context: ToolContext, event: CanvasEvent) => void,
  onMove: (context: ToolContext, event: CanvasEvent) => void,
  onEnd: (context: ToolContext, event: CanvasEvent) => void,
  draw: (view: View) => void
}

export const skeletonTool: SkeletonTool = {
  initialPoint: undefined,
  cursorPoint: undefined,

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
    if (!context.editor.activeView.hitTarget(event)) {
      return CallbackStatus.Stop
    }

    const point = resolveEventPoint(event)
    if (!point) { return }

    this.cursorPoint = point
    if (FeatureFlagsManager.isOnLayerV2) {
      this.draw(context.editor.activeView)
    } else {
      context.editor.activeView.annotationsLayer.changed()
    }
    if (!this.initialPoint) { return }
    return CallbackStatus.Stop
  },

  async onEnd (context: ToolContext, event: CanvasEvent) {
    if (!this.initialPoint) { return }

    const point = resolveEventPoint(event, true)
    if (point) {
      this.cursorPoint = point
    }

    if (!this.cursorPoint) { return }

    const p1 = context.editor.activeView.camera.canvasViewToImageView(this.cursorPoint)
    const p2 = context.editor.activeView.camera.canvasViewToImageView(this.initialPoint)

    const threshold = 5
    if (Math.abs(p1.x - p2.x) < threshold || Math.abs(p1.y - p2.y) < threshold) {
      this.reset(context)
      if (FeatureFlagsManager.isOnLayerV2) {
        this.draw(context.editor.activeView)
      } else {
        context.editor.activeView.annotationsLayer.changed()
      }
      return
    }

    const { x: width, y: height } = p1.sub(p2)

    if (!context.editor.activeView.annotationManager.preselectedAnnotationClass) { return }

    const metadata = context.editor.activeView.annotationManager.preselectedAnnotationClass.metadata
    if (!metadata.skeleton) { return }
    const nodes = metadata.skeleton.nodes.map(node => ({
      point: new EditablePoint<'Image'>({ x: p2.x + node.x * width, y: p2.y + node.y * height }),
      name: node.name,
      occluded: false
    }))
    const skeleton: Skeleton = { nodes }
    const params = { type: annotationType, data: skeleton }
    try {
      await context.editor
        .activeView
        .annotationManager
        .createAnnotationAction(params)
    } catch (e: unknown) {
      console.error(e)
    }

    this.reset(context)
    if (FeatureFlagsManager.isOnLayerV2) {
      this.draw(context.editor.activeView)
    } else {
      context.editor.activeView.annotationsLayer.changed()
    }
  },

  async activate (context: ToolContext) {
    setupWheelPanning(context)
    setupTouchPanning(context)
    setupWASDPanning(context)
    setupZoom(context)

    // ask to preselect an annotation class if it's not preselected when activating the tool
    const preselectedAnnotationClassIds = context
      .editor
      .store
      .state
      .workview
      .preselectedAnnotationClassIds
    const hasPreselectedAnnotationClass =
      'skeleton_tool' in preselectedAnnotationClassIds &&
      preselectedAnnotationClassIds.skeleton_tool

    if (!hasPreselectedAnnotationClass) {
      const annotationClass =
        await context.editor.activeView.annotationManager.resolveAnnotationClass(annotationType)
      if (!annotationClass) {
        const content =
          'You must create or select an exising Skeleton class before using the skeleton tool'
        context.editor.store.dispatch('toast/notify', { content })
        context.editor.toolManager.activateToolWithStore('edit_tool')
        return
      }
      context.editor.store.commit('workview/PRESELECT_CLASS_ID', annotationClass.id)
    }

    context.editor.selectCursor(EditorCursor.BBox)

    context.editor.registerCommand('skeleton_tool.cancel', () => {
      this.reset(context)
      if (FeatureFlagsManager.isOnLayerV2) {
        this.draw(context.editor.activeView)
      } else {
        context.editor.activeView.annotationsLayer.changed()
      }
      return CallbackStatus.Stop
    })

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
          const ctx = view.annotationsLayer.context
          if (!ctx) { return }

          if (this.cursorPoint) {
            drawGuideLines(ctx, view, this.cursorPoint)
          }

          if (this.cursorPoint == null || this.initialPoint == null) { return }

          ctx.beginPath()
          ctx.strokeStyle =
            context.editor.activeView.annotationManager.preselectedAnnotationClassColor()
          ctx.lineWidth = 1
          ctx.strokeRect(this.initialPoint.x, this.initialPoint.y,
            this.cursorPoint.x - this.initialPoint.x, this.cursorPoint.y - this.initialPoint.y)

          if (!context.editor.activeView.annotationManager.preselectedAnnotationClass) { return }
          drawTemporarySkeleton(
            view.camera,
            view.annotationsLayer.context,
            this.initialPoint,
            this.cursorPoint,
            context.editor.activeView.annotationManager.preselectedAnnotationClass
          )
        })
      )

      context.handles.push(...viewsOnRender)
    }
  },

  draw (view: View): void {
    view.annotationsLayer.draw((ctx, canvas, draw) => {
      if (this.cursorPoint) {
        drawGuideLines(ctx, view, this.cursorPoint)
      }

      if (this.cursorPoint == null || this.initialPoint == null) { return }

      ctx.beginPath()
      ctx.strokeStyle =
          view.annotationManager.preselectedAnnotationClassColor()
      ctx.lineWidth = 1
      ctx.strokeRect(this.initialPoint.x, this.initialPoint.y,
        this.cursorPoint.x - this.initialPoint.x, this.cursorPoint.y - this.initialPoint.y)

      if (!view.annotationManager.preselectedAnnotationClass) { return }

      if (!draw) { return }

      drawTemporarySkeletonV2(
        draw,
        view,
        this.initialPoint,
        this.cursorPoint,
        view.annotationManager.preselectedAnnotationClass
      )
    })
  },

  deactivate (context: ToolContext): void {
    if (FeatureFlagsManager.isOnLayerV2) {
      context.editor.activeView.annotationsLayer.draw()
    } else {
      context.editor.activeView.annotationsLayer.changed()
    }
  },

  reset () {
    this.initialPoint = undefined
    this.cursorPoint = undefined
  }
}
