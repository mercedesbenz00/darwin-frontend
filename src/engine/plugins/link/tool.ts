import { EditorCursor } from '@/engine/EditorCursor'
import { drawLink } from '@/engine/graphics'
import { Tool, ToolContext } from '@/engine/managers'
import { Annotation } from '@/engine/models/annotation'
import { IView } from '@/engine/models/views/types'
import {
  setupPrimaryButtonPanning,
  setupWheelPanning,
  setupTouchPanning,
  setupWASDPanning,
  setupZoom
} from '@/engine/plugins/mixins'
import { CallbackStatus } from '@/engineCommon/callbackHandler'
import { ImagePoint } from '@/engineCommon/point'
import { CanvasEvent, resolveEventPoint } from '@/utils/touch'

import { Link, LINK_ANNOTATION_TYPE } from './types'
import { inferCentroid } from './utils'

export class LinkTool implements Tool {
  /**
   * Annotation the link points at its start
   */
  fromAnnotation?: Annotation

  /**
   * Annotation the link points at its end
   */
  toAnnotation?: Annotation

  cursorPoint?: ImagePoint

  async addLink (context: ToolContext): Promise<void> {
    const { fromAnnotation, toAnnotation } = this

    if (!fromAnnotation || !toAnnotation) {
      throw new Error('Missing annotation to create a new Link annotation')
    }

    if (
      fromAnnotation.type === LINK_ANNOTATION_TYPE ||
      toAnnotation.type === LINK_ANNOTATION_TYPE
    ) {
      throw new Error('Trying to create a link from/to another link')
    }

    const link: Link = {
      from: fromAnnotation.id,
      to: toAnnotation.id
    }

    await context.editor.activeView.createAnnotation({ type: LINK_ANNOTATION_TYPE, data: link })

    this.reset()
  }

  activate (context: ToolContext): void {
    setupWheelPanning(context)

    context.editor.selectCursor(EditorCursor.Draw)

    context.editor.registerCommand('link_tool.cancel', () => {
      this.reset()
      context.editor.activeView.annotationsLayer.changed()
    })

    context.handles.push(...context.editor.onMouseDown(e => this.onStart(context, e)))
    context.handles.push(...context.editor.onMouseMove(e => this.onMove(context, e)))
    context.handles.push(...context.editor.onMouseUp(() => this.onEnd(context)))

    context.handles.push(...context.editor.onTouchStart(e => this.onStart(context, e)))
    context.handles.push(...context.editor.onTouchMove(e => this.onMove(context, e)))
    context.handles.push(...context.editor.onTouchEnd(() => this.onEnd(context)))

    const viewsOnRender = context.editor.viewsList.map(view =>
      view.renderManager.onRender((view) => this.onRender(view, context))
    )

    context.handles.push(...viewsOnRender)

    setupPrimaryButtonPanning(context)
    setupTouchPanning(context)
    setupWASDPanning(context)
    setupZoom(context)
  }

  onStart (context: ToolContext, event: CanvasEvent): void {
    const canvasPoint = resolveEventPoint(event)
    if (!canvasPoint) { return }

    const imagePoint = context.editor.camera.canvasViewToImageView(canvasPoint)

    this.fromAnnotation = context.editor.findTopAnnotationAt(
      imagePoint,
      (annotation: Annotation) => annotation.type !== LINK_ANNOTATION_TYPE
    )
  }

  onMove (context: ToolContext, event: CanvasEvent): CallbackStatus | void {
    if (!context.editor.activeView.hitTarget(event)) {
      return CallbackStatus.Stop
    }

    context.editor.unhighlightAll()

    const canvasPoint = resolveEventPoint(event)
    if (!canvasPoint) { return }

    this.cursorPoint = context.editor.camera.canvasViewToImageView(canvasPoint)

    const topAnnotation = context.editor.findTopAnnotationAt(
      this.cursorPoint,
      (annotation: Annotation) => annotation.type !== LINK_ANNOTATION_TYPE
    )

    if (topAnnotation) {
      topAnnotation.highlight()

      if (this.fromAnnotation && this.fromAnnotation.id !== topAnnotation.id) {
        this.cursorPoint = inferCentroid(topAnnotation, context.editor)
      }
    }

    context.editor.activeView.annotationsLayer.changed()

    return this.fromAnnotation ? CallbackStatus.Stop : CallbackStatus.Continue
  }

  async onEnd (context: ToolContext): Promise<void> {
    if (!this.fromAnnotation) { return this.reset() }

    if (!this.cursorPoint) { return }

    this.toAnnotation = context.editor.findTopAnnotationAt(
      this.cursorPoint,
      (annotation: Annotation) => annotation.type !== LINK_ANNOTATION_TYPE
    )

    const { fromAnnotation, toAnnotation } = this

    if (!toAnnotation) {
      context.editor.store.dispatch('toast/notify', {
        content: 'Release your cursor on top of an annotation.'
      })
      return this.reset()
    }

    if (fromAnnotation === toAnnotation) {
      context.editor.store.dispatch('toast/notify', {
        content: 'Cannot link an annotation to itself. Please choose another annotation.'
      })
      return this.reset()
    }

    await this.addLink(context)

    context.editor.activeView.annotationsLayer.changed()

    this.reset()
  }

  onRender (view: IView, context: ToolContext): void {
    const ctx = view.annotationsLayer.context
    if (!ctx) { return }

    const { cursorPoint, fromAnnotation } = this
    if (!cursorPoint || !fromAnnotation) { return }

    const centroid = inferCentroid(fromAnnotation, context.editor)
    if (!centroid) { return }

    drawLink(
      view,
      [centroid, cursorPoint],
      { r: 227, g: 234, b: 242, a: 1.0 },
      context.editor.activeView.imageFilter
    )
  }

  deactivate (): void { }

  reset (): void {
    this.cursorPoint = undefined
    this.fromAnnotation = undefined
    this.toAnnotation = undefined
  }
}

export const tool = new LinkTool()
