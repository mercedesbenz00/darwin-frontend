import { euclideanDistance } from '@/engineCommon/algebra'
import { CallbackStatus } from '@/engineCommon/callbackHandler'
import { POINT_CLICK_THRESHOLD } from '@/engineCommon/constants'
import { CanvasPoint, EditablePoint } from '@/engineCommon/point'
import { Rectangle } from '@/engineCommon/rectangle'
import { EditorCursor } from '@/engineV2/EditorCursor'
import { drawGuideLines } from '@/engineV2/graphics/drawGuideLines'
import { Tool, ToolContext } from '@/engineV2/managers'
import { FeatureFlagsManager } from '@/engineV2/managers/featureFlagsManager'
import { AnnotationData } from '@/engineV2/models/annotation'
import {
  setupTouchPanning,
  setupWASDPanning,
  setupZoom,
  setupWheelPanning
} from '@/engineV2/plugins/mixins'
import { View } from '@/engineV2/views'
import { isLeftMouseButton } from '@/utils/mouse'
import { CanvasEvent, resolveEventPoint } from '@/utils/touch'

import { measures } from './measures'
import { BoundingBox, BOUNDING_BOX_ANNOTATION_TYPE } from './types'

interface BoundingBoxTool extends Tool {
  initialPoint?: CanvasPoint,
  cursorPoint?: CanvasPoint,
  saving: Boolean,
  onStart: (context: ToolContext, event: CanvasEvent) => void
  onMove: (context: ToolContext, event: CanvasEvent) => void
  onEnd: (context: ToolContext, event: CanvasEvent) => void
  draw: (view: View) => void
}

export const createBoundingBoxData = (
  context: ToolContext,
  p1: CanvasPoint,
  p2: CanvasPoint
): AnnotationData | null => {
  const imageP1 = context.editor.activeView.camera.canvasViewToImageView(p1)
  const imageP2 = context.editor.activeView.camera.canvasViewToImageView(p2)
  const box = new Rectangle(imageP1, imageP2)

  if (!box.isValid()) {
    return null
  }

  const boundingBox: BoundingBox = {
    topLeft: new EditablePoint(box.topLeft),
    topRight: new EditablePoint(box.topRight),
    bottomRight: new EditablePoint(box.bottomRight),
    bottomLeft: new EditablePoint(box.bottomLeft)
  }

  return boundingBox
}

export const updateDrawingMeasuresOverlay = (
  context: ToolContext,
  initialPoint: CanvasPoint,
  cursorPoint: CanvasPoint
): void => {
  const boundingBox = createBoundingBoxData(context, cursorPoint, initialPoint)
  if (boundingBox) {
    const measureData = measures.calculateDrawingMeasureOverlayData(
      context.editor.activeView,
      boundingBox
    )
    if (measureData) {
      context.editor.activeView.measureManager.updateOverlayForDrawingAnnotation(measureData)
    } else {
      context.editor.activeView.measureManager.removeOverlayForDrawingAnnotation()
    }
  } else {
    context.editor.activeView.measureManager.removeOverlayForDrawingAnnotation()
  }
}

export const tool: BoundingBoxTool = {
  initialPoint: undefined,
  cursorPoint: undefined,
  saving: false,

  /**
   * Uses OptimisedLayer to draw a bounding box
   * works only with LayerV2 feature flag enabled
   * @param view
   */
  draw (view) {
    view.annotationsLayer.draw(ctx => {
      if (this.cursorPoint) {
        drawGuideLines(ctx, view, this.cursorPoint)
      }

      if (this.cursorPoint == null || this.initialPoint == null) { return }

      ctx.beginPath()
      ctx.strokeStyle = view.annotationManager.preselectedAnnotationClassColor()
      ctx.fillStyle = view.annotationManager.preselectedAnnotationClassColor(0.15)
      ctx.lineWidth = 1

      const x = this.initialPoint.x
      const y = this.initialPoint.y
      const w = this.cursorPoint.x - this.initialPoint.x
      const h = this.cursorPoint.y - this.initialPoint.y
      ctx.strokeRect(x, y, w, h)
      ctx.fillRect(x, y, w, h)
    })
  },

  onStart (context: ToolContext, event: CanvasEvent) {
    if (this.saving) { return CallbackStatus.Stop }

    const point = resolveEventPoint(event)
    if (!point) { return }

    if (!this.initialPoint) {
      this.initialPoint = point
    }
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

    if (this.saving) { return CallbackStatus.Stop }

    const point = resolveEventPoint(event)
    if (!point) { return }

    this.cursorPoint = point
    if (FeatureFlagsManager.isOnLayerV2) {
      this.draw(context.editor.activeView)
    } else {
      context.editor.activeView.annotationsLayer.changed()
    }
    if (!this.initialPoint) { return }

    if (context.editor.activeView.measureManager.showMeasures) {
      updateDrawingMeasuresOverlay(context, this.initialPoint, this.cursorPoint)
    }
    return CallbackStatus.Stop
  },

  async onEnd (context: ToolContext, event: CanvasEvent) {
    if (this.saving) { return CallbackStatus.Stop }

    const point = resolveEventPoint(event, true)
    if (point !== null) {
      this.cursorPoint = point
    }

    if (!this.initialPoint || !this.cursorPoint) { return }

    if (euclideanDistance(this.initialPoint, this.cursorPoint) < POINT_CLICK_THRESHOLD) {
      return
    }

    const boundingBox = createBoundingBoxData(context, this.cursorPoint, this.initialPoint)

    if (!boundingBox) {
      this.initialPoint = undefined
      this.cursorPoint = undefined
      if (FeatureFlagsManager.isOnLayerV2) {
        this.draw(context.editor.activeView)
      } else {
        context.editor.activeView.annotationsLayer.changed()
      }
      return
    }

    const params = { type: BOUNDING_BOX_ANNOTATION_TYPE, data: boundingBox }
    try {
      this.saving = true
      await context.editor
        .activeView
        .annotationManager
        .createAnnotationAction(params)
    } catch (e: unknown) {
      console.error(e)
    } finally {
      this.reset(context)

      if (context.editor.activeView.measureManager.showMeasures) {
        context.editor.activeView.measureManager.removeOverlayForDrawingAnnotation()
      }
    }
    if (FeatureFlagsManager.isOnLayerV2) {
      this.draw(context.editor.activeView)
    } else {
      context.editor.activeView.annotationsLayer.changed()
    }
  },

  activate (context: ToolContext) {
    setupWheelPanning(context)
    setupTouchPanning(context)
    setupWASDPanning(context)
    setupZoom(context)

    context.editor.selectCursor(EditorCursor.BBox)

    context.editor.registerCommand('bounding_box_tool.cancel', () => {
      this.reset(context)
      if (FeatureFlagsManager.isOnLayerV2) {
        this.draw(context.editor.activeView)
      } else {
        context.editor.activeView.annotationsLayer.changed()
      }
    })

    context.handles.push(...context.editor.onMouseDown(e => {
      if (!isLeftMouseButton(e)) { return CallbackStatus.Continue }
      return this.onStart(context, e)
    }))
    context.handles.push(...context.editor.onTouchStart(event => this.onStart(context, event)))
    context.handles.push(...context.editor.onMouseMove(event => this.onMove(context, event)))
    context.handles.push(...context.editor.onTouchMove(event => this.onMove(context, event)))
    context.handles.push(...context.editor.onMouseUp(event => this.onEnd(context, event)))
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
          ctx.fillStyle =
            context.editor.activeView.annotationManager.preselectedAnnotationClassColor(0.15)
          ctx.lineWidth = 1

          const x = this.initialPoint.x
          const y = this.initialPoint.y
          const w = this.cursorPoint.x - this.initialPoint.x
          const h = this.cursorPoint.y - this.initialPoint.y
          ctx.strokeRect(x, y, w, h)
          ctx.fillRect(x, y, w, h)
        })
      )

      context.handles.push(...viewsOnRender)
    }
  },
  deactivate (context: ToolContext) {
    if (FeatureFlagsManager.isOnLayerV2) {
      context.editor.activeView.annotationsLayer.draw()
    }
  },
  reset (context: ToolContext) {
    this.initialPoint = undefined
    this.cursorPoint = undefined
    this.saving = false

    if (FeatureFlagsManager.isOnLayerV2) {
      context.editor.activeView.annotationManager.cachedDeselectAllAnnotations()
      context.editor.activeView.annotationManager.cachedUnhighlightAllAnnotations()
    }

    if (context.editor.activeView.measureManager.showMeasures) {
      context.editor.activeView.measureManager.removeOverlayForDrawingAnnotation()
    }
  }
}
