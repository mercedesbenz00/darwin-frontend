import { CallbackStatus } from '@/engineCommon/callbackHandler'
import { ImagePoint } from '@/engineCommon/point'
import { EditorCursor } from '@/engineV2/EditorCursor'
import { drawLink, drawLinkV2 } from '@/engineV2/graphics'
import { Tool, ToolContext } from '@/engineV2/managers'
import { FeatureFlagsManager } from '@/engineV2/managers/featureFlagsManager'
import { Annotation } from '@/engineV2/models/annotation'
import {
  setupTouchPanning,
  setupWASDPanning,
  setupWheelPanning,
  setupZoom
} from '@/engineV2/plugins/mixins'
import { View } from '@/engineV2/views'
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

    try {
      await context.editor
        .activeView
        .annotationManager
        .createAnnotationAction({
          type: LINK_ANNOTATION_TYPE,
          data: link
        })
    } catch (e: unknown) {
      console.error(e)
    }

    this.reset()
  }

  activate (context: ToolContext): void {
    setupWheelPanning(context)
    setupTouchPanning(context)
    setupWASDPanning(context)
    setupZoom(context)

    context.editor.selectCursor(EditorCursor.Draw)

    context.editor.registerCommand('link_tool.cancel', () => {
      this.reset()
      if (FeatureFlagsManager.isOnLayerV2) {
        this.draw(context.editor.activeView)
      } else {
        context.editor.activeView.annotationsLayer.changed()
      }
    })

    context.handles.push(...context.editor.onMouseDown(e => this.onStart(context, e)))
    context.handles.push(...context.editor.onMouseMove(e => this.onMove(context, e)))
    context.handles.push(...context.editor.onMouseUp(() => this.onEnd(context)))

    context.handles.push(...context.editor.onTouchStart(e => this.onStart(context, e)))
    context.handles.push(...context.editor.onTouchMove(e => this.onMove(context, e)))
    context.handles.push(...context.editor.onTouchEnd(() => this.onEnd(context)))

    if (FeatureFlagsManager.isOffLayerV2) {
      const viewsOnRender = context.editor.viewsList.map(view =>
        view.renderManager.onRender((view) => this.onRender(view, context))
      )

      context.handles.push(...viewsOnRender)
    }
  }

  onStart (context: ToolContext, event: CanvasEvent): void {
    const canvasPoint = resolveEventPoint(event)
    if (!canvasPoint) { return }

    const imagePoint = context.editor.activeView.camera.canvasViewToImageView(canvasPoint)

    this.fromAnnotation = context.editor.activeView.annotationManager.findTopAnnotationAt(
      imagePoint,
      (annotation: Annotation) => annotation.type !== LINK_ANNOTATION_TYPE
    )
  }

  onMove (context: ToolContext, event: CanvasEvent): CallbackStatus | void {
    if (!context.editor.activeView.hitTarget(event)) {
      return CallbackStatus.Stop
    }

    context.editor.activeView.unhighlightAll()

    const canvasPoint = resolveEventPoint(event)
    if (!canvasPoint) { return }

    this.cursorPoint = context.editor.activeView.camera.canvasViewToImageView(canvasPoint)

    const topAnnotation = context.editor.activeView.annotationManager.findTopAnnotationAt(
      this.cursorPoint,
      (annotation: Annotation) => annotation.type !== LINK_ANNOTATION_TYPE
    )

    if (topAnnotation) {
      context.editor.activeView.annotationManager.highlightAnnotation(topAnnotation.id)

      if (this.fromAnnotation && this.fromAnnotation.id !== topAnnotation.id) {
        this.cursorPoint = inferCentroid(topAnnotation, context.editor)
      }
    }

    if (FeatureFlagsManager.isOnLayerV2) {
      this.draw(context.editor.activeView)
    } else {
      context.editor.activeView.annotationsLayer.changed()
    }
    return this.fromAnnotation ? CallbackStatus.Stop : CallbackStatus.Continue
  }

  async onEnd (context: ToolContext): Promise<CallbackStatus | void> {
    if (!this.fromAnnotation) { return this.reset() }

    if (!this.cursorPoint) { return }

    this.toAnnotation = context.editor.activeView.annotationManager.findTopAnnotationAt(
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
    if (FeatureFlagsManager.isOnLayerV2) {
      this.draw(context.editor.activeView)
    } else {
      context.editor.activeView.annotationsLayer.changed()
    }
    this.reset()
  }

  onRender (view: View, context: ToolContext): void {
    const ctx = view.annotationsLayer.context
    if (!ctx) { return }

    const { cursorPoint, fromAnnotation } = this
    if (!cursorPoint || !fromAnnotation) { return }

    const centroid = inferCentroid(fromAnnotation, context.editor)
    if (!centroid) { return }

    drawLink(
      view.camera,
      view.annotationsLayer.context,
      [centroid, cursorPoint],
      { r: 227, g: 234, b: 242, a: 1.0 },
      context.editor.activeView.imageFilter
    )
  }

  draw (view: View): void {
    const { cursorPoint, fromAnnotation } = this
    if (!cursorPoint || !fromAnnotation) { return }

    const centroid = inferCentroid(fromAnnotation, view.editor)
    if (!centroid) { return }

    drawLinkV2(
      fn => view.annotationsLayer.draw(fn),
      view.camera,
      [centroid, cursorPoint],
      { r: 227, g: 234, b: 242, a: 1.0 },
      view.imageFilter
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
