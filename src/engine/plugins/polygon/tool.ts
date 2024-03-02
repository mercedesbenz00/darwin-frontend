import { EditorCursor } from '@/engine/EditorCursor'
import { moveVertexAction } from '@/engine/actions'
import { drawIncompletePath } from '@/engine/graphics'
import {
  ActionGroup,
  isMainAnnotationTypeRenderer,
  Tool,
  ToolContext
} from '@/engine/managers'
import { Annotation } from '@/engine/models/annotation'
import { IView } from '@/engine/models/views/types'
import {
  setupTouchPanning,
  setupWASDPanning,
  setupWheelPanning,
  setupZoom
} from '@/engine/plugins/mixins'
import { maybeSimplifyPolygon, euclideanDistance } from '@/engineCommon/algebra'
import { CallbackStatus } from '@/engineCommon/callbackHandler'
import { Camera } from '@/engineCommon/camera'
import {
  CanvasPoint,
  EditableImagePoint,
  EditablePoint,
  ImagePoint,
  pointIsVertexOfPath
} from '@/engineCommon/point'
import { isLeftMouseButton } from '@/utils/mouse'
import { CanvasEvent, isTouchEvent, resolveEventPoint } from '@/utils/touch'

import { measures } from './measures'
import { DISTANCE_THRESHOLD, Polygon, POLYGON_ANNOTATION_TYPE } from './types'
import {
  insertPoint,
  isInsertingPoint,
  findClosestPolygonEdge
} from './utils'
import { interpolateBetweenPoints } from './utils/interpolateBetweenPoints'

type Timeout = any | null

const interpolatePath = (path: EditableImagePoint[]) => {
  const interpolatedPath = []
  for (let i = 0; i < path.length; i++) {
    const p1 = path[i]
    interpolatedPath.push(p1)

    if (i + 1 === path.length) { break }

    const p2 = path[i + 1]
    const interpolatedPoints = interpolateBetweenPoints(p1, p2)
    for (const point of interpolatedPoints) {
      interpolatedPath.push(point)
    }
  }
  return interpolatedPath
}

// Checks is pointA(initial) is not equal pointB(moved)
const isMoved = (pointA: ImagePoint, pointB: ImagePoint): boolean => (
  Math.floor(pointA.x - pointB.x) !== 0 ||
  Math.floor(pointA.y - pointB.y) !== 0
)

export class PolygonTool implements Tool {
  /**
   * Path of the polygon currently being drawn
   */
  currentPath: ImagePoint[] = []

  /**
   * Last known position of the mouse (on image)
   *
   * Constantly updates as mouse moves.
   */
  previousMouseMovePosition: ImagePoint | undefined = undefined

  /**
   * Last click position of the mouse (on image)
   */
  previousMouseClickPosition: ImagePoint | undefined = undefined

  /**
   * Initial position of the mouse on mouse down (on image)
   *
   * Is set on mouse down and does not update as mouse moves.
   */
  initialMouseDownPosition: ImagePoint | undefined = undefined

  vertexMoving: EditableImagePoint | undefined = undefined
  overVertex: boolean = false

  /**
   * Boolean value representing a state in which the tool is currently awaiting
   * for a polygon to be created.
   *
   * It's used to prevent double-clicking when closing path generating two polygons.
   * async/await can't be used for that matter, because onMouseMove won't behave
   * as expected with it.
   */
  creatingAnnotation: boolean = false

  pointOnLine: CanvasPoint | null = null
  pointOnLineAnnotation: Annotation | null = null
  pointOnLinePath: EditableImagePoint[] | null = null
  pointOnLinePosition: number | null = null
  actionGroup: ActionGroup | undefined = undefined

  /**
   * Flag used to determine whether the user is drawing a polygon by using
   * a touch interface or a mouse.
   */
  touching: boolean = false

  /**
   * Flag used to determine whether the user is using clicking and dragging
   * to draw a scribble polygon.
   */
  dragging: boolean = false
  private draggingTimeout: Timeout = null

  startDragging (): void {
    this.draggingTimeout = setTimeout(() => {
      this.dragging = true
    }, 10)
  }

  endDragging (): void {
    this.dragging = false
    clearTimeout(this.draggingTimeout)
    this.draggingTimeout = null
  }

  originAnnotation?: Annotation

  cursorIsClosingPath (camera: Camera, point?: ImagePoint): boolean {
    const { currentPath, previousMouseMovePosition } = this

    if (currentPath.length <= 2) { return false }

    const targetPoint = point || previousMouseMovePosition
    if (!targetPoint) { return false }

    const canvasPoint = camera.imageViewToCanvasView(targetPoint)
    return camera.cursorIsClosingPath(canvasPoint, currentPath[0])
  }

  async addPolygon (context: ToolContext) {
    if (this.creatingAnnotation) { return }

    let annotation
    this.creatingAnnotation = true
    try {
      const currentPath = this.currentPath.map((value) => new EditablePoint<'Image'>(value))

      // We need to interpolate the path to make sure it's smooth.
      const interpolatedPath = interpolatePath(currentPath)

      // We need to simplify the path to make sure the resulting polygon does not have too
      // many vertices.
      const epsilon = (document as any).darwin_epsilon || 0.5
      const path = maybeSimplifyPolygon(interpolatedPath, epsilon)
        .map(point => new EditablePoint<'Image'>(point))

      const polygon: Polygon = { path }
      const params = { type: POLYGON_ANNOTATION_TYPE, data: polygon }
      annotation = await context.editor.activeView.createAnnotation(params)
    } finally {
      this.creatingAnnotation = false
      if (context.editor.showMeasures) {
        context.editor.activeView.measureManager.removeOverlayForDrawingAnnotation()
      }
    }

    if (!annotation) { return }

    if (this.actionGroup) {
      this.actionGroup.remove()
      this.actionGroup = undefined
    }

    this.currentPath = []
  }

  updateDrawingMeasuresOverlay (context: ToolContext): void {
    if (this.currentPath.length === 0) { return }
    const path = [...this.currentPath]
    if (this.previousMouseMovePosition) {
      path.push(this.previousMouseMovePosition)
    }

    const data: Polygon = { path: path.map((p) => new EditablePoint(p)) }
    const measureData = measures.calculateDrawingMeasureOverlayData(context.editor.activeView, data)
    if (measureData) {
      context.editor.activeView.measureManager.updateOverlayForDrawingAnnotation(measureData)
    } else {
      context.editor.activeView.measureManager.removeOverlayForDrawingAnnotation()
    }
  }

  addPoint (context: ToolContext, point: ImagePoint) {
    if (this.currentPath.length > 0) {
      // prevent to push extremely near point
      const lastPoint = this.currentPath[this.currentPath.length - 1]
      const distance = euclideanDistance(lastPoint, point)
      if (distance < DISTANCE_THRESHOLD) {
        return
      }
    }

    const action = {
      do: () => {
        this.currentPath.push(point)
        context.editor.activeView.annotationsLayer.changed()
        return true
      },
      undo: () => {
        this.currentPath.splice(-1, 1)
        context.editor.activeView.annotationsLayer.changed()
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

    context.editor.registerCommand('polygon_tool.cancel', () => {
      this.reset(context)
      context.editor.activeView.annotationsLayer.changed()
    })

    context.editor.registerCommand('polygon_tool.close', async () => {
      if (this.currentPath.length > 2) { await this.addPolygon(context) }
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

    const viewsOnRender = context.editor.viewsList.map(view =>
      view.renderManager.onRender((view) => this.onRender(view, context))
    )

    context.handles.push(...viewsOnRender)
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

  onStart (context: ToolContext, event: CanvasEvent): void | CallbackStatus.Stop {
    this.maybeSuppressMouseEvent(event)

    this.originAnnotation = context.editor.selectedAnnotation?.clone()

    const point = resolveEventPoint(event)
    if (!point) { return }

    this.startDragging()

    const canvasPoint = point
    const imagePoint = context.editor.camera.canvasViewToImageView(canvasPoint)

    this.initialMouseDownPosition = imagePoint

    // inserted point can be selected and start moving within the same tick,
    // so this does not return
    if (isInsertingPoint(this)) { insertPoint(this, context) }

    // this one is rendered in place of initial click otherwise
    this.pointOnLine = null

    const vertex = context.editor.findAnnotationVertexAt(imagePoint)
    if (this.currentPath.length === 0 && vertex) {
      context.editor.deselectAllVertices()
      vertex.isSelected = true
      this.vertexMoving = vertex
      return CallbackStatus.Stop
    }

    if (!this.cursorIsClosingPath(context.editor.camera, imagePoint)) {
      this.addPoint(context, imagePoint)
    }

    return CallbackStatus.Stop
  }

  onMove (context: ToolContext, event: CanvasEvent): void | CallbackStatus.Stop {
    if (!context.editor.activeView.hitTarget(event)) {
      return CallbackStatus.Stop
    }

    this.maybeSuppressMouseEvent(event)

    const point = resolveEventPoint(event)
    if (!point) { return }

    const canvasPoint = point
    const imagePoint = context.editor.camera.canvasViewToImageView(canvasPoint)

    const vertex = context.editor.findAnnotationVertexAt(imagePoint)
    const { previousMouseMovePosition, vertexMoving } = this

    if (this.touching) {
      context.editor.selectCursor(EditorCursor.Draw)

      this.addPoint(context, imagePoint)

      if (context.editor.showMeasures) {
        this.updateDrawingMeasuresOverlay(context)
      }

      this.overVertex = false
      this.previousMouseMovePosition = imagePoint

      return CallbackStatus.Stop
    }

    this.overVertex = false
    this.previousMouseMovePosition = imagePoint

    // Vertex translation
    if (previousMouseMovePosition && vertexMoving) {
      this.overVertex = true
      // Move a vertex only when it belongs to the selected annotation
      const selectedAnnotation = context.editor.selectedAnnotation
      if (selectedAnnotation) {
        const renderer = context
          .editor
          .activeView
          .renderManager
          .rendererFor(selectedAnnotation.type)
        if (isMainAnnotationTypeRenderer(renderer)) {
          const path = renderer.getAllVertices(selectedAnnotation, context.editor.activeView)
          if (path && pointIsVertexOfPath(vertexMoving, path, 5 / context.editor.cameraScale)) {
            renderer.moveVertex(
              selectedAnnotation,
              vertexMoving,
              imagePoint.sub(previousMouseMovePosition),
              context.editor.activeView
            )
          } else {
            // When we do not move the vertex keep the mouse
            // move position the same as the init position
            this.previousMouseMovePosition = this.initialMouseDownPosition
          }
        }
        // force the path to be recalculated
        selectedAnnotation.path2D = undefined
      }
    } else if (vertex && this.currentPath.length === 0) {
      this.overVertex = true
      context.editor.unhighlightAllVertices()
      vertex.isHighlighted = true
      this.pointOnLine = null
      context.editor.selectCursor(EditorCursor.Edit)
    } else if (this.currentPath.length === 0) {
      this.pointOnLine = null
      const result = findClosestPolygonEdge(context.editor, canvasPoint, 5)

      if (result !== null) {
        const [point, annotation, position, path] = result
        annotation.highlight()
        annotation.select()

        this.pointOnLine = context.editor.camera.imageViewToCanvasView(point)
        this.pointOnLineAnnotation = annotation
        this.pointOnLinePath = path
        this.pointOnLinePosition = position
        context.editor.selectCursor(EditorCursor.AddPoint)
      } else {
        context.editor.selectCursor(EditorCursor.Draw)
        if (context.editor.showMeasures) {
          this.updateDrawingMeasuresOverlay(context)
        }
      }

      context.editor.unhighlightAllVertices()
    } else if (this.cursorIsClosingPath(context.editor.camera)) {
      this.previousMouseMovePosition = this.currentPath[0]
      context.editor.selectCursor(EditorCursor.Edit)
      context.editor.unhighlightAllVertices()
    } else if (this.dragging) {
      context.editor.selectCursor(EditorCursor.Draw)
      this.addPoint(context, imagePoint)
      if (context.editor.showMeasures) {
        this.updateDrawingMeasuresOverlay(context)
      }
      return CallbackStatus.Stop
    } else {
      context.editor.selectCursor(EditorCursor.Draw)
      if (context.editor.showMeasures) {
        this.updateDrawingMeasuresOverlay(context)
      }
      context.editor.unhighlightAllVertices()
    }
    context.editor.activeView.annotationsLayer.changed()
  }

  async onEnd (context: ToolContext, event: CanvasEvent) {
    this.maybeSuppressMouseEvent(event)

    const { activeView, actionManager, selectedAnnotation } = context.editor

    const { camera, renderManager } = activeView

    this.endDragging()

    const point = resolveEventPoint(event, true)
    if (point) {
      const imagePoint = camera.canvasViewToImageView(point)
      if (this.previousMouseClickPosition) {
        const distance = euclideanDistance(imagePoint, this.previousMouseClickPosition)
        if (distance < DISTANCE_THRESHOLD) {
          return CallbackStatus.Stop
        }
      }

      this.previousMouseClickPosition = imagePoint
    }

    const { initialMouseDownPosition, previousMouseMovePosition, vertexMoving } = this
    if (
      selectedAnnotation &&
      vertexMoving &&
      initialMouseDownPosition &&
      previousMouseMovePosition
    ) {
      const renderer = renderManager.rendererFor(selectedAnnotation.type)
      if (
        isMoved(initialMouseDownPosition, previousMouseMovePosition) &&
        isMainAnnotationTypeRenderer(renderer)
      ) {
        renderer.moveVertex(
          selectedAnnotation,
          vertexMoving,
          initialMouseDownPosition.sub(previousMouseMovePosition),
          context.editor.activeView
        )

        const action = moveVertexAction(
          context.editor,
          this.originAnnotation,
          selectedAnnotation,
          vertexMoving,
          initialMouseDownPosition,
          previousMouseMovePosition,
          renderer.moveVertex
        )

        actionManager.do(action)
      }
      this.resetContext(context)
    } else if (this.cursorIsClosingPath(camera, previousMouseMovePosition)) {
      // snap cursor point to close path
      this.previousMouseMovePosition = this.currentPath[0]
      await this.addPolygon(context)
      this.resetContext(context)
    }

    context.editor.activeView.annotationsLayer.changed()
    return CallbackStatus.Stop
  }

  onRender (view: IView, context: ToolContext) {
    const ctx = view.annotationsLayer.context
    if (!ctx) { return }

    const { currentPath, pointOnLine, previousMouseMovePosition, overVertex } = this
    if (currentPath.length === 0) {
      if (pointOnLine !== null) {
        ctx.strokeStyle = context.editor.selectedAnnotationClassColor()
        ctx.fillStyle = 'rgb(255,255,255)'
        ctx.lineWidth = 1
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
            context.editor.preselectedAnnotationClassColor()
          )
        }
      }
      return
    }

    if (!this.dragging && !this.touching && previousMouseMovePosition) {
      const path = [...this.currentPath, previousMouseMovePosition]
      drawIncompletePath(path, ctx, view.camera, context.editor.preselectedAnnotationClassColor())
    } else {
      drawIncompletePath(
        this.currentPath,
        ctx,
        view.camera,
        context.editor.preselectedAnnotationClassColor()
      )
    }
  }

  deactivate () { }

  reset (context: ToolContext) {
    this.resetContext(context)
    this.currentPath = []
  }

  resetContext (context: ToolContext) {
    this.pointOnLine = null
    this.initialMouseDownPosition = undefined
    this.previousMouseMovePosition = undefined
    this.previousMouseClickPosition = undefined
    this.vertexMoving = undefined
    this.touching = false
    this.endDragging()

    if (context.editor.showMeasures) {
      context.editor.activeView.measureManager.removeOverlayForDrawingAnnotation()
    }
  }

  async confirmCurrentAnnotation (context: ToolContext): Promise<void> {
    await this.addPolygon(context)
  }

  isDrawing (): boolean {
    return this.currentPath.length > 0
  }
}

export const tool = new PolygonTool()
