import { CallbackStatus } from '@/engineCommon/callbackHandler'
import {
  CanvasPoint,
  EditableImagePoint,
  EditablePoint,
  ImagePoint,
  pointIsVertexOfPath
} from '@/engineCommon/point'
import { EditorCursor } from '@/engineV2/EditorCursor'
import { moveVertexAction } from '@/engineV2/actions'
import { drawIncompletePath } from '@/engineV2/graphics'
import {
  Action,
  ActionGroup,
  isMainAnnotationTypeRenderer,
  Tool,
  ToolContext
} from '@/engineV2/managers'
import { FeatureFlagsManager } from '@/engineV2/managers/featureFlagsManager'
import { Annotation } from '@/engineV2/models/annotation'
import {
  setupTouchPanning,
  setupWASDPanning,
  setupWheelPanning,
  setupZoom
} from '@/engineV2/plugins/mixins'
import { View } from '@/engineV2/views'
import { isLeftMouseButton } from '@/utils/mouse'
import { CanvasEvent, isTouchEvent, resolveEventPoint } from '@/utils/touch'

import { measures } from './measures'
import { Polyline, POLYLINE_ANNOTATION_TYPE } from './types'
import { findClosestPolylineEdge, insertPoint, isInsertingPoint } from './utils'

export class PolylineTool implements Tool {
  /**
   * Path of the polyline currently being drawn
   */
  currentPath: ImagePoint[] = []

  /**
   * Last known position of the mouse (on image)
   *
   * Constantly updates as mouse moves.
   */
  previousMouseMovePosition: ImagePoint | undefined = undefined

  /**
   * Initial position of the mouse on mouse down (on image)
   *
   * Is set on mouse down and does not update as mouse moves.
   */
  initialMouseDownPosition: ImagePoint | undefined = undefined

  cursorPoint: CanvasPoint | undefined = undefined

  vertexMoving: EditableImagePoint | undefined = undefined
  overVertex: boolean = false

  pointOnLine: CanvasPoint | null = null
  pointOnLineAnnotation: Annotation | null = null
  pointOnLinePath: EditableImagePoint[] | null = null
  pointOnLinePosition: number | null = null
  actionGroup: ActionGroup | undefined = undefined

  touching: boolean = false

  async addPolyline (context: ToolContext) {
    const polyline: Polyline = {
      path: this.currentPath.map((value) => new EditablePoint(value))
    }
    const params = { type: POLYLINE_ANNOTATION_TYPE, data: polyline }
    let annotation
    try {
      annotation = await context.editor
        .activeView
        .annotationManager
        .createAnnotationAction(params)
    } catch (e: unknown) {
      console.error(e)
    }
    if (!annotation) { return }

    if (this.actionGroup) {
      this.actionGroup.remove()
      this.actionGroup = undefined
    }

    this.currentPath = []
  }

  addPoint (context: ToolContext, point: ImagePoint) {
    const action: Action = {
      do: () => {
        this.currentPath.push(point)
        if (FeatureFlagsManager.isOnLayerV2) {
          this.draw(context.editor.activeView)
        } else {
          context.editor.activeView.annotationsLayer.changed()
        }
        return true
      },
      undo: () => {
        this.currentPath.splice(-1, 1)
        if (FeatureFlagsManager.isOnLayerV2) {
          this.draw(context.editor.activeView)
        } else {
          context.editor.activeView.annotationsLayer.changed()
        }
        return true
      }
    }
    this.actionGroup = this.actionGroup || context.editor.actionManager.createGroup()
    this.actionGroup.do(action)
  }

  activate (context: ToolContext) {
    setupWheelPanning(context)
    setupTouchPanning(context)
    setupWASDPanning(context)
    setupZoom(context)

    context.editor.selectCursor(EditorCursor.Draw)

    context.editor.registerCommand('polyline_tool.cancel', () => {
      this.reset(context)
      if (FeatureFlagsManager.isOnLayerV2) {
        this.draw(context.editor.activeView)
      } else {
        context.editor.activeView.annotationsLayer.changed()
      }
    })

    context.editor.registerCommand('polyline_tool.confirm', () => {
      if (this.currentPath.length > 1) { this.addPolyline(context) }
    })

    context.handles.push(...context.editor.onDoubleClick(() => this.onDoubleClick(context)))
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
        view.renderManager.onRender((view) => this.onRender(view, context))
      )

      context.handles.push(...viewsOnRender)
    }
  }

  async onDoubleClick (context: ToolContext) {
    this.currentPath.pop()
    if (this.currentPath.length === 1) {
      if (context.editor.activeView.measureManager.showMeasures) {
        context.editor.activeView.measureManager.removeOverlayForDrawingAnnotation()
      }
      return
    }
    try {
      await this.addPolyline(context)
    } finally {
      if (context.editor.activeView.measureManager.showMeasures) {
        context.editor.activeView.measureManager.removeOverlayForDrawingAnnotation()
      }
    }
  }

  updateDrawingMeasuresOverlay (context: ToolContext) {
    if (this.currentPath.length === 0) { return }
    const path = [...this.currentPath]
    if (this.previousMouseMovePosition) {
      path.push(this.previousMouseMovePosition)
    }

    const data: Polyline = { path: path.map((p) => new EditablePoint(p)) }
    const measureData = measures.calculateDrawingMeasureOverlayData(context.editor.activeView, data)
    if (measureData) {
      context.editor.activeView.measureManager.updateOverlayForDrawingAnnotation(measureData)
    } else {
      context.editor.activeView.measureManager.removeOverlayForDrawingAnnotation()
    }
  }

  maybeSuppressMouseEvent (event: CanvasEvent) {
    event.preventDefault()
    const touching = isTouchEvent(event)
    if (!touching && this.touching) {
      // A touch event was already triggered, so we should prevent this mouse event to trigger
      return CallbackStatus.Stop
    } else {
      this.touching = touching
    }
  }

  onStart (context: ToolContext, event: CanvasEvent) {
    this.maybeSuppressMouseEvent(event)

    if (isTouchEvent(event) && event.targetTouches.length > 2 && this.currentPath.length > 1) {
      this.addPolyline(context)
      return
    }

    const point = resolveEventPoint(event)
    if (!point) { return }

    this.cursorPoint = point
    const imagePoint = context.editor.activeView.camera.canvasViewToImageView(this.cursorPoint)

    this.initialMouseDownPosition = imagePoint
    this.previousMouseMovePosition = imagePoint

    // inserted point can be selected and start moving within the same tick,
    // so this does not return
    if (isInsertingPoint(this)) { insertPoint(this, context) }

    // this one is rendered in place of initial click otherwise
    this.pointOnLine = null

    const vertex = context.editor.activeView.annotationManager.findAnnotationVertexAt(imagePoint)
    if (this.currentPath.length === 0 && vertex) {
      context.editor.activeView.deselectAllVertices()
      vertex.isSelected = true
      this.vertexMoving = vertex
    } else if (vertex) {
      vertex.isSelected = true
      this.vertexMoving = vertex
    } else {
      this.addPoint(context, imagePoint)
    }

    return CallbackStatus.Stop
  }

  onMove (context: ToolContext, event: CanvasEvent) {
    if (!context.editor.activeView.hitTarget(event)) {
      return CallbackStatus.Stop
    }

    this.maybeSuppressMouseEvent(event)

    const point = resolveEventPoint(event)
    if (!point) { return }

    this.cursorPoint = point
    const imagePoint = context.editor.activeView.camera.canvasViewToImageView(this.cursorPoint)
    const vertex = context.editor.activeView.annotationManager.findAnnotationVertexAt(imagePoint)

    const { previousMouseMovePosition, vertexMoving } = this

    this.overVertex = false
    this.previousMouseMovePosition = imagePoint

    // Vertex translation
    if (previousMouseMovePosition && vertexMoving) {
      this.overVertex = true
      // Move a vertex only when it belongs to the selected annotation
      const selectedAnnotation = context.editor.activeView.annotationManager.selectedAnnotation
      if (selectedAnnotation) {
        const { activeView } = context.editor

        const renderer = activeView.renderManager.rendererFor(selectedAnnotation.type)
        if (isMainAnnotationTypeRenderer(renderer)) {
          const { path } = renderer.getPath(selectedAnnotation, activeView)
          if (
            path &&
            pointIsVertexOfPath(vertexMoving, path, 5 / context.editor.activeView.cameraScale)
          ) {
            renderer.moveVertex(
              selectedAnnotation,
              vertexMoving,
              imagePoint.sub(previousMouseMovePosition),
              activeView
            )
          }
        }
        // force the path to be recalculated
        selectedAnnotation.path2D = undefined
      }
    } else if (vertex && this.currentPath.length === 0) {
      this.overVertex = true
      context.editor.activeView.unhighlightAllVertices()
      vertex.isHighlighted = true
      this.pointOnLine = null
      context.editor.selectCursor(EditorCursor.Edit)
    } else if (this.currentPath.length === 0) {
      this.pointOnLine = null
      const result = findClosestPolylineEdge(context.editor, this.cursorPoint, 5)

      if (result !== null) {
        const [point, annotation, position, path] = result
        context.editor.activeView.annotationManager.highlightAnnotation(annotation.id)
        context.editor
          .activeView
          .annotationManager
          .selectAnnotation(annotation.id)

        this.pointOnLine = context.editor.activeView.camera.imageViewToCanvasView(point)
        this.pointOnLineAnnotation = annotation
        this.pointOnLinePath = path
        this.pointOnLinePosition = position
        context.editor.selectCursor(EditorCursor.AddPoint)
      } else {
        context.editor.selectCursor(EditorCursor.Draw)
        if (context.editor.activeView.measureManager.showMeasures) {
          this.updateDrawingMeasuresOverlay(context)
        }
      }

      context.editor.activeView.unhighlightAllVertices()
    } else {
      context.editor.selectCursor(EditorCursor.Draw)
      if (context.editor.activeView.measureManager.showMeasures) {
        this.updateDrawingMeasuresOverlay(context)
      }
      context.editor.activeView.unhighlightAllVertices()
    }
    if (FeatureFlagsManager.isOnLayerV2) {
      this.draw(context.editor.activeView)
    } else {
      context.editor.activeView.annotationsLayer.changed()
    }
  }

  onEnd (context: ToolContext, event: CanvasEvent) {
    this.maybeSuppressMouseEvent(event)

    const point = resolveEventPoint(event, true)
    if (point) {
      this.cursorPoint = point
    }

    if (!this.cursorPoint) { return }

    const canvasPoint = this.cursorPoint
    const imagePoint = context.editor.activeView.camera.canvasViewToImageView(canvasPoint)
    const selectedAnnotation = context.editor.activeView.annotationManager.selectedAnnotation

    const { initialMouseDownPosition, previousMouseMovePosition, vertexMoving } = this

    if (
      selectedAnnotation &&
      vertexMoving &&
      initialMouseDownPosition &&
      previousMouseMovePosition
    ) {
      const renderer = context.editor.activeView.renderManager.rendererFor(selectedAnnotation.type)
      if (isMainAnnotationTypeRenderer(renderer)) {
        renderer.moveVertex(
          selectedAnnotation,
          vertexMoving,
          initialMouseDownPosition.sub(imagePoint),
          context.editor.activeView
        )

        const action = moveVertexAction(
          context.editor.activeView,
          undefined,
          selectedAnnotation,
          vertexMoving,
          initialMouseDownPosition,
          imagePoint,
          renderer.moveVertex
        )

        context.editor.actionManager.do(action)
      }
      this.resetContext(context)
    }

    if (FeatureFlagsManager.isOnLayerV2) {
      this.draw(context.editor.activeView)
    } else {
      context.editor.activeView.annotationsLayer.changed()
    }
    return CallbackStatus.Stop
  }

  onRender (view: View, context: ToolContext): void {
    const ctx = view.annotationsLayer.context
    if (!ctx) { return }
    const { currentPath, pointOnLine, previousMouseMovePosition, overVertex } = this
    if (currentPath.length === 0) {
      if (pointOnLine !== null) {
        ctx.strokeStyle = context.editor.activeView.annotationManager.selectedAnnotationClassColor()
        ctx.fillStyle = 'rgb(255,255,255)'
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.arc(pointOnLine.x, pointOnLine.y, 3.5, 0, 2 * Math.PI)
        ctx.fill()
        ctx.stroke()
        ctx.closePath()
      } else {
        if (previousMouseMovePosition && !overVertex) {
          const path = [previousMouseMovePosition]
          drawIncompletePath(
            path,
            ctx,
            view.camera,
            context.editor.activeView.annotationManager.preselectedAnnotationClassColor()
          )
        }
      }
      return
    }
    if (previousMouseMovePosition) {
      const path = [...this.currentPath, previousMouseMovePosition]
      drawIncompletePath(
        path,
        ctx,
        view.camera,
        context.editor.activeView.annotationManager.preselectedAnnotationClassColor()
      )
    }
  }

  draw (view: View): void {
    view.annotationsLayer.draw(ctx => {
      const { currentPath, pointOnLine, previousMouseMovePosition, overVertex } = this
      if (currentPath.length === 0) {
        if (pointOnLine !== null) {
          ctx.strokeStyle = view.annotationManager.selectedAnnotationClassColor()
          ctx.fillStyle = 'rgb(255,255,255)'
          ctx.lineWidth = 1.5
          ctx.beginPath()
          ctx.arc(pointOnLine.x, pointOnLine.y, 3.5, 0, 2 * Math.PI)
          ctx.fill()
          ctx.stroke()
          ctx.closePath()
        } else {
          if (previousMouseMovePosition && !overVertex) {
            const path = [previousMouseMovePosition]
            drawIncompletePath(
              path,
              ctx,
              view.camera,
              view.annotationManager.preselectedAnnotationClassColor()
            )
          }
        }
        return
      }
      if (previousMouseMovePosition) {
        const path = [...this.currentPath, previousMouseMovePosition]
        drawIncompletePath(
          path,
          ctx,
          view.camera,
          view.annotationManager.preselectedAnnotationClassColor()
        )
      }
    })
  }

  deactivate (context: ToolContext): void {
    if (FeatureFlagsManager.isOnLayerV2) {
      context.editor.activeView.annotationsLayer.draw()
    }
  }

  reset (context: ToolContext): void {
    this.resetContext(context)
    this.currentPath = []
  }

  resetContext (context: ToolContext): void {
    this.pointOnLine = null
    this.initialMouseDownPosition = undefined
    this.previousMouseMovePosition = undefined
    this.vertexMoving = undefined
    this.touching = false

    if (context.editor.activeView.measureManager.showMeasures) {
      context.editor.activeView.measureManager.removeOverlayForDrawingAnnotation()
    }
  }

  async confirmCurrentAnnotation (context: ToolContext): Promise<void> {
    await this.addPolyline(context)
  }

  isDrawing (): boolean {
    return this.currentPath.length > 0
  }
}

export const tool = new PolylineTool()
