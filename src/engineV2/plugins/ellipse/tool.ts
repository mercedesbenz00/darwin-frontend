import cloneDeep from 'lodash/cloneDeep'

import { euclideanDistance } from '@/engineCommon/algebra'
import { CallbackStatus } from '@/engineCommon/callbackHandler'
import {
  CanvasPoint,
  EditableImagePoint,
  EditablePoint,
  ImagePoint,
  pointIsVertexOfPath
} from '@/engineCommon/point'
import { EditorCursor } from '@/engineV2/EditorCursor'
import { updateAnnotationData } from '@/engineV2/actions'
import { isMainAnnotationTypeRenderer, Tool, ToolContext } from '@/engineV2/managers'
import { FeatureFlagsManager } from '@/engineV2/managers/featureFlagsManager'
import { AnnotationData } from '@/engineV2/models/annotation'
import {
  setupTouchPanning,
  setupWASDPanning,
  setupWheelPanning,
  setupZoom
} from '@/engineV2/plugins/mixins'
import { resolveModifierByPriority } from '@/engineV2/utils'
import { View } from '@/engineV2/views'
import { isLeftMouseButton } from '@/utils/mouse'
import { CanvasEvent, resolveEventPoint } from '@/utils/touch'

import { measures } from './measures'
import { Ellipse, ELLIPSE_ANNOTATION_TYPE } from './types'

interface EllipseTool extends Tool {
  initialPoint?: CanvasPoint
  cursorPoint?: CanvasPoint
  hoveringVertex?: EditableImagePoint
  initialAnnotationData?: AnnotationData,
  onStart: (context: ToolContext, event: CanvasEvent) => void,
  onMove: (context: ToolContext, event: CanvasEvent) => void,
  onEnd: (context: ToolContext, event: CanvasEvent) => void,
  draw: (view: View) => void,
  renderFn: (ctx: CanvasRenderingContext2D, view: View) => void
}

export const createEllipseData = (
  context: ToolContext,
  initialPoint: CanvasPoint,
  cursorPoint: CanvasPoint
): Ellipse | null => {
  const p1 = context.editor.activeView.camera.canvasViewToImageView(cursorPoint)
  const p2 = context.editor.activeView.camera.canvasViewToImageView(initialPoint)

  const center = new EditablePoint<'Image'>(p2.add(p1).div(2))
  const right = new EditablePoint<'Image'>(p1)
  const { x: symY, y: symX } = right.sub(center)
  const top = new EditablePoint<'Image'>({ x: symX + center.x, y: symY + center.y })
  const bottom = new EditablePoint<'Image'>({ x: center.x - symX, y: center.y - symY })
  const left = new EditablePoint<'Image'>({ x: center.x - symY, y: center.y - symX })

  const ellipse: Ellipse = { center, top, right, bottom, left }

  return ellipse
}

export const updateDrawingMeasuresOverlay = (
  context: ToolContext,
  initialPoint: CanvasPoint,
  cursorPoint: CanvasPoint
): void => {
  const ellipse = createEllipseData(context, cursorPoint, initialPoint)
  if (ellipse) {
    const measureData = measures.calculateDrawingMeasureOverlayData(
      context.editor.activeView,
      ellipse
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

export const tool: EllipseTool = {
  onStart (context: ToolContext, event: CanvasEvent) {
    const point = resolveEventPoint(event)
    if (!point) { return }

    const { camera, isLoading } = context.editor.activeView
    const { selectedAnnotation } = context.editor.activeView.annotationManager

    this.initialPoint = point
    if (!this.hoveringVertex) {
      if (FeatureFlagsManager.isOnLayerV2) {
        this.draw(context.editor.activeView)
      } else {
        context.editor.activeView.annotationsLayer.changed()
      }
      return
    }

    this.hoveringVertex.isSelected = true
    if (!selectedAnnotation) {
      if (FeatureFlagsManager.isOnLayerV2) {
        this.draw(context.editor.activeView)
      } else {
        context.editor.activeView.annotationsLayer.changed()
      }
      return CallbackStatus.Stop
    }

    // Save initial annotation data, which is a necessary argument for undoable/redoable action
    this.initialAnnotationData = cloneDeep(selectedAnnotation.data)

    if (!selectedAnnotation.isVideoAnnotation()) {
      if (FeatureFlagsManager.isOnLayerV2) {
        this.draw(context.editor.activeView)
      } else {
        context.editor.activeView.annotationsLayer.changed()
      }
      return CallbackStatus.Stop
    }

    const { data, subs } = selectedAnnotation.inferVideoData(context.editor.activeView)
    if (isLoading) { throw new Error('Ellipse: Expected video to be loaded') }
    context
      .editor
      .activeView
      .annotationManager
      .updateAnnotationFrame(
        selectedAnnotation,
        cloneDeep(data),
        subs,
        context.editor.activeView.currentFrameIndex
      )

    // Force update hovering vertex with clicked one,
    // so it's possible to select it right away and trigger ellipse editing
    // This operation is only necessary for videos, since highlighting/selecting
    // vertices only works on keyframes in our current API
    const initialImagePoint = camera.canvasViewToImageView(this.initialPoint)
    this.hoveringVertex =
      context.editor.activeView.annotationManager.findAnnotationVertexAt(initialImagePoint)
    if (this.hoveringVertex) {
      this.hoveringVertex.isSelected = true
    }

    if (FeatureFlagsManager.isOnLayerV2) {
      this.draw(context.editor.activeView)
    } else {
      context.editor.activeView.annotationsLayer.changed()
    }
    return CallbackStatus.Stop
  },

  onMove (context: ToolContext, event: CanvasEvent) {
    if (!context.editor.activeView.hitTarget(event)) {
      return CallbackStatus.Stop
    }

    context.editor.activeView.unhighlightAllVertices()

    let previousCursorImagePoint: ImagePoint | undefined
    if (this.cursorPoint) {
      previousCursorImagePoint =
        context.editor.activeView.camera.canvasViewToImageView(this.cursorPoint)
    }

    const point = resolveEventPoint(event)
    if (!point) { return }

    this.cursorPoint = point

    // If we're hovering over a selected vertex, move the vertex
    const cursorImagePoint =
      context.editor.activeView.camera.canvasViewToImageView(this.cursorPoint)

    if (this.hoveringVertex && this.hoveringVertex.isSelected) {
      const selectedAnnotation = context.editor.activeView.annotationManager.selectedAnnotation
      if (!selectedAnnotation) {
        this.reset(context)
        if (FeatureFlagsManager.isOnLayerV2) {
          this.draw(context.editor.activeView)
        } else {
          context.editor.activeView.annotationsLayer.changed()
        }
        return
      }

      if (!previousCursorImagePoint) {
        this.reset(context)
        if (FeatureFlagsManager.isOnLayerV2) {
          this.draw(context.editor.activeView)
        } else {
          context.editor.activeView.annotationsLayer.changed()
        }
        return
      }

      const renderer = context.editor.activeView.renderManager.rendererFor(selectedAnnotation.type)
      if (!isMainAnnotationTypeRenderer(renderer)) { return }

      if (!selectedAnnotation.isVideoAnnotation()) {
        renderer.moveVertex(
          selectedAnnotation,
          this.hoveringVertex,
          cursorImagePoint.sub(previousCursorImagePoint),
          context.editor.activeView,
          resolveModifierByPriority(event)
        )
        if (FeatureFlagsManager.isOnLayerV2) {
          this.draw(context.editor.activeView)
        } else {
          context.editor.activeView.annotationsLayer.changed()
        }
        return
      }

      const { isLoading } = context.editor.activeView
      if (isLoading) { return }

      const { data: annotationData, keyframe, subs } = selectedAnnotation.inferVideoData(
        context.editor.activeView
      )
      if (!annotationData) { return }
      // If it's not yet a key frame, make it a key frame
      // Then we need to relocate the vertex since cloneDeep breaks the old link.
      if (!keyframe) {
        const { isLoading } = context.editor.activeView
        if (isLoading) { return }
        context.editor.activeView.annotationManager.updateAnnotationFrame(
          selectedAnnotation,
          cloneDeep(annotationData),
          subs,
          context.editor.activeView.currentFrameIndex
        )
      }

      // Build an Annotation object with current frame data, then translate it
      const currentAnnotation = selectedAnnotation.shallowClone({ data: annotationData })
      const path = renderer.getAllVertices(currentAnnotation, context.editor.activeView)
      if (
        path &&
        pointIsVertexOfPath(this.hoveringVertex, path, 5 / context.editor.activeView.cameraScale)
      ) {
        renderer.moveVertex(
          currentAnnotation,
          this.hoveringVertex,
          cursorImagePoint.sub(previousCursorImagePoint),
          context.editor.activeView,
          resolveModifierByPriority(event)
        )
        context.editor.activeView.annotationManager.updateAnnotationFrame(
          selectedAnnotation,
          currentAnnotation.data,
          subs,
          context.editor.activeView.currentFrameIndex
        )
      }
    }

    // If we're drawing a new ellipse, just record the new cursor point and repaint
    if (this.initialPoint) {
      if (context.editor.activeView.measureManager.showMeasures) {
        updateDrawingMeasuresOverlay(context, this.initialPoint, this.cursorPoint)
      }
      if (FeatureFlagsManager.isOnLayerV2) {
        this.draw(context.editor.activeView)
      } else {
        context.editor.activeView.annotationsLayer.changed()
      }
      return CallbackStatus.Stop
    }

    // If we're not drawing an ellipse, see if we're hovering over an existing ellipse
    const topAnnotation =
      context.editor.activeView.annotationManager.findTopAnnotationAt(cursorImagePoint)

    // If we're not hovering over any annotation,
    // or we're on top of an annotation which is not an ellipse, repaint and return
    if (!topAnnotation || topAnnotation.type !== ELLIPSE_ANNOTATION_TYPE) {
      context.editor.activeView.annotationManager.unhighlightAllAnnotations()
      context.editor.activeView.annotationManager.deselectAllAnnotations()
      this.reset(context)
      if (FeatureFlagsManager.isOnLayerV2) {
        this.draw(context.editor.activeView)
      } else {
        context.editor.activeView.annotationsLayer.changed()
      }
      return
    }

    // If we're hovering over an existing ellipse,
    // select it, and see if we're hovering over a control point
    context.editor.activeView.annotationManager.highlightAnnotation(topAnnotation.id)
    context.editor
      .activeView
      .annotationManager
      .selectAnnotation(topAnnotation.id)

    this.hoveringVertex =
      context.editor.activeView.annotationManager.findAnnotationVertexAt(cursorImagePoint)

    if (this.hoveringVertex) {
      this.hoveringVertex.isHighlighted = true
    }

    if (FeatureFlagsManager.isOnLayerV2) {
      this.draw(context.editor.activeView)
    } else {
      context.editor.activeView.annotationsLayer.changed()
    }
    return CallbackStatus.Stop
  },

  async onEnd (context: ToolContext, event: CanvasEvent) {
    if (!this.initialPoint || !this.cursorPoint) { return this.reset(context) }

    if (this.hoveringVertex && this.hoveringVertex.isSelected) {
      const selectedAnnotation = context.editor.activeView.annotationManager.selectedAnnotation
      if (!selectedAnnotation) { return this.reset(context) }

      const renderer = context.editor.activeView.renderManager.rendererFor(selectedAnnotation.type)
      if (!isMainAnnotationTypeRenderer(renderer)) { return this.reset(context) }

      if (!this.initialAnnotationData) { return this.reset(context) }

      const action = updateAnnotationData(
        context.editor.activeView,
        selectedAnnotation,
        this.initialAnnotationData,
        selectedAnnotation.data
      )

      context.editor.actionManager.do(action)

      this.reset(context)
      if (FeatureFlagsManager.isOnLayerV2) {
        this.draw(context.editor.activeView)
      } else {
        context.editor.activeView.annotationsLayer.changed()
      }
      return CallbackStatus.Stop
    }

    const point = resolveEventPoint(event, true)
    if (point) {
      this.cursorPoint = point
    }

    const ellipse = createEllipseData(context, this.initialPoint, this.cursorPoint)
    if (!ellipse) {
      this.reset(context)
      if (context.editor.activeView.measureManager.showMeasures) {
        context.editor.activeView.measureManager.removeOverlayForDrawingAnnotation()
      }
      if (FeatureFlagsManager.isOnLayerV2) {
        this.draw(context.editor.activeView)
      } else {
        context.editor.activeView.annotationsLayer.changed()
      }
      return
    }

    const params = { type: ELLIPSE_ANNOTATION_TYPE, data: ellipse }

    try {
      await context.editor
        .activeView
        .annotationManager
        .createAnnotationAction(params)
    } catch (e: unknown) {
      console.error(e)
    } finally {
      if (context.editor.activeView.measureManager.showMeasures) {
        context.editor.activeView.measureManager.removeOverlayForDrawingAnnotation()
      }
    }

    this.reset(context)
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

    context.editor.selectCursor(EditorCursor.Ellipse)

    context.editor.registerCommand('ellipse_tool.cancel', () => {
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
    context.handles.push(...context.editor.onMouseMove(e => this.onMove(context, e)))
    context.handles.push(...context.editor.onMouseUp(e => this.onEnd(context, e)))

    context.handles.push(...context.editor.onTouchStart(e => this.onStart(context, e)))
    context.handles.push(...context.editor.onTouchMove(e => this.onMove(context, e)))
    context.handles.push(...context.editor.onTouchEnd(e => this.onEnd(context, e)))

    if (FeatureFlagsManager.isOffLayerV2) {
      const viewsOnRender = context.editor.viewsList.map(view =>
        view.renderManager.onRender((view: View) => {
          const ctx = view.annotationsLayer.context
          if (!ctx) { return }

          this.renderFn(ctx, view)
        })
      )

      context.handles.push(...viewsOnRender)
    }
  },

  deactivate (context: ToolContext) {
    if (FeatureFlagsManager.isOnLayerV2) {
      this.draw(context.editor.activeView)
    }
  },

  renderFn (ctx: CanvasRenderingContext2D, view: View) {
    if (
      !this.initialPoint || !this.cursorPoint ||
        (this.hoveringVertex && this.hoveringVertex.isSelected)
    ) { return }

    ctx.lineWidth = 1
    ctx.strokeStyle = view.annotationManager.preselectedAnnotationClassColor()
    ctx.fillStyle = view.annotationManager.preselectedAnnotationClassColor()

    ctx.beginPath()
    ctx.setLineDash([10, 5])
    ctx.moveTo(this.initialPoint.x, this.initialPoint.y)
    ctx.lineTo(this.cursorPoint.x, this.cursorPoint.y)
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(this.initialPoint.x, this.initialPoint.y, 3.5, 0, 2 * Math.PI)
    ctx.stroke()
    ctx.fill()

    ctx.beginPath()
    ctx.arc(this.cursorPoint.x, this.cursorPoint.y, 3.5, 0, 2 * Math.PI)
    ctx.stroke()
    ctx.fill()

    ctx.fillStyle = view.annotationManager.preselectedAnnotationClassColor(0.15)
    const center = this.initialPoint.add(this.cursorPoint).div(2)
    ctx.beginPath()
    ctx.setLineDash([])
    ctx.arc(center.x, center.y, euclideanDistance(this.cursorPoint, center), 0, 2 * Math.PI)
    ctx.stroke()
    ctx.fill()
  },

  draw (view) {
    view.annotationsLayer.draw(ctx => {
      this.renderFn(ctx, view)
    })
  },

  reset (context: ToolContext) {
    this.initialPoint = undefined
    this.cursorPoint = undefined
    this.hoveringVertex = undefined

    if (context.editor.activeView.measureManager.showMeasures) {
      context.editor.activeView.measureManager.removeOverlayForDrawingAnnotation()
    }
  }
}
