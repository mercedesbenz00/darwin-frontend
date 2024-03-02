import { EditorCursor } from '@/engine/EditorCursor'
import { drawTemporarySkeleton } from '@/engine/graphics'
import { Tool, ToolContext } from '@/engine/managers'
import {
  setupTouchPanning,
  setupWASDPanning,
  setupWheelPanning,
  setupZoom
} from '@/engine/plugins/mixins'
import { CallbackStatus } from '@/engineCommon/callbackHandler'
import { CanvasPoint, EditablePoint } from '@/engineCommon/point'
import { isLeftMouseButton } from '@/utils/mouse'
import { CanvasEvent, resolveEventPoint } from '@/utils/touch'

import { annotationType } from './consts'
import { Skeleton } from './types'

export interface SkeletonTool extends Tool {
  initialPoint?: CanvasPoint,
  cursorPoint?: CanvasPoint,

  onStart: (context: ToolContext, event: CanvasEvent) => void,
  onMove: (context: ToolContext, event: CanvasEvent) => void,
  onEnd: (context: ToolContext, event: CanvasEvent) => void
}

export const skeletonTool: SkeletonTool = {
  initialPoint: undefined,
  cursorPoint: undefined,

  onStart (context: ToolContext, event: CanvasEvent) {
    const point = resolveEventPoint(event)
    if (!point) { return }

    this.initialPoint = point
    context.editor.activeView.annotationsLayer.changed()
  },

  onMove (context: ToolContext, event: CanvasEvent) {
    if (!context.editor.activeView.hitTarget(event)) {
      return CallbackStatus.Stop
    }

    const point = resolveEventPoint(event)
    if (!point) { return }

    this.cursorPoint = point
    context.editor.activeView.annotationsLayer.changed()
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

    const p1 = context.editor.camera.canvasViewToImageView(this.cursorPoint)
    const p2 = context.editor.camera.canvasViewToImageView(this.initialPoint)

    const threshold = 5
    if (Math.abs(p1.x - p2.x) < threshold || Math.abs(p1.y - p2.y) < threshold) {
      this.reset(context)
      context.editor.activeView.annotationsLayer.changed()
      return
    }

    const { x: width, y: height } = p1.sub(p2)

    if (!context.editor.activeView.preselectedAnnotationClass) { return }

    const metadata = context.editor.activeView.preselectedAnnotationClass.metadata
    if (!metadata.skeleton) { return }
    const nodes = metadata.skeleton.nodes.map(node => ({
      point: new EditablePoint<'Image'>({ x: p2.x + node.x * width, y: p2.y + node.y * height }),
      name: node.name,
      occluded: false
    }))
    const skeleton: Skeleton = { nodes }
    const params = { type: annotationType, data: skeleton }
    await context.editor.activeView.createAnnotation(params)

    this.reset(context)
    context.editor.activeView.annotationsLayer.changed()
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
      const annotationClass = await context.editor.activeView.resolveAnnotationClass(annotationType)
      if (!annotationClass) {
        const content =
          'You must create or select an exising Skeleton class before using the skeleton tool'
        context.editor.store.dispatch('toast/notify', { content })
        context.editor.activateTool('edit_tool')
        return
      }
      context.editor.store.commit('workview/PRESELECT_CLASS_ID', annotationClass.id)
    }

    context.editor.selectCursor(EditorCursor.BBox)

    context.editor.registerCommand('skeleton_tool.cancel', () => {
      this.reset(context)
      context.editor.activeView.annotationsLayer.changed()
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

    const viewsOnRender = context.editor.viewsList.map(view =>
      view.renderManager.onRender((view) => {
        const ctx = view.annotationsLayer.context
        if (!ctx) { return }

        if (this.cursorPoint) {
          ctx.beginPath()
          ctx.lineWidth = 0.5
          ctx.strokeStyle = 'rgb(227, 234, 242)' // Alice Shade
          ctx.moveTo(this.cursorPoint.x, 0)
          ctx.lineTo(this.cursorPoint.x, view.height)
          ctx.moveTo(0, this.cursorPoint.y)
          ctx.lineTo(view.width, this.cursorPoint.y)
          ctx.stroke()
        }

        if (this.cursorPoint == null || this.initialPoint == null) { return }

        ctx.beginPath()
        ctx.strokeStyle = context.editor.preselectedAnnotationClassColor()
        ctx.lineWidth = 1
        ctx.strokeRect(this.initialPoint.x, this.initialPoint.y,
          this.cursorPoint.x - this.initialPoint.x, this.cursorPoint.y - this.initialPoint.y)

        if (!context.editor.activeView.preselectedAnnotationClass) { return }
        drawTemporarySkeleton(
          view,
          this.initialPoint,
          this.cursorPoint,
          context.editor.activeView.preselectedAnnotationClass
        )
      })
    )

    context.handles.push(...viewsOnRender)
  },

  deactivate () {},

  reset () {
    this.initialPoint = undefined
    this.cursorPoint = undefined
  }
}
