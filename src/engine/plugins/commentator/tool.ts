import { EditorCursor } from '@/engine/EditorCursor'
import { moveCommentThreadVertexAction, moveCommentThreadAction } from '@/engine/actions'
import { Tool, ToolContext } from '@/engine/managers'
import { CommentThread } from '@/engine/models'
import { IView } from '@/engine/models/views/types'
import {
  setupTouchPanning,
  setupWASDPanning,
  setupWheelPanning,
  setupZoom
} from '@/engine/plugins/mixins'
import { euclideanDistance } from '@/engineCommon/algebra'
import { CallbackStatus } from '@/engineCommon/callbackHandler'
import { CommentVertices } from '@/engineCommon/comment'
import {
  CanvasPoint,
  EditableImagePoint,
  ImagePoint,
  Point,
  pointIsVertexOfPath
} from '@/engineCommon/point'
import { Rectangle } from '@/engineCommon/rectangle'
import { isLeftMouseButton } from '@/utils/mouse'
import { CanvasEvent, resolveEventPoint } from '@/utils/touch'

import { CommentatorRenderer } from './CommentatorRenderer'

interface CommentatorTool extends Tool {
  /** Initial point of mouse click during mouse drag */
  initialPoint?: ImagePoint

  /** Current point of mouse click during mouse drag */
  cursorPoint?: ImagePoint

  /** Current point of mouse cursor in the canvas */
  canvasPoint?: CanvasPoint

  /** Holds reference to the comment thread currently being moved */
  commentThreadMoving?: CommentThread,

  /** Holds reference to the vertex currently being moved */
  vertexMoving?: EditableImagePoint

  onStart (context: ToolContext, event: CanvasEvent): void
  onMove (context: ToolContext, event: CanvasEvent): void
  onEnd (context: ToolContext, event: CanvasEvent): void
  onRender (context: ToolContext, view: IView): void

  moveVertex (context: ToolContext, mousePoint: ImagePoint): void
  moveCommentThread (context: ToolContext, mousePoint: ImagePoint): void
}

/**
 * Reset selection of everything in editor
 */
const resetSelection = (context: ToolContext): void => {
  context.editor.deselectAll()
  context.editor.deselectAllVertices()
  context.editor.unhighlightAll()
  context.editor.unhighlightAllVertices()
}

export const tool: CommentatorTool = {
  moveVertex (context: ToolContext, mousePoint: ImagePoint): CallbackStatus {
    const { selectedCommentThread } = context.editor.activeView.commentManager
    const { vertexMoving, initialPoint } = this

    if (!selectedCommentThread || !vertexMoving || !initialPoint) { return CallbackStatus.Stop }

    context.editor.activeView.commentManager.setCommentThreadMoving(selectedCommentThread)

    const renderer = context.editor.activeView.renderManager.rendererFor('commentator')
    if (renderer && 'getPath' in renderer) {
      const { path } = renderer.getPath(selectedCommentThread, context.editor.activeView)
      if (path && pointIsVertexOfPath(vertexMoving, path, 5 / context.editor.cameraScale)) {
        renderer.moveVertex(
          selectedCommentThread,
          vertexMoving,
          mousePoint.sub(vertexMoving),
          context.editor.activeView
        )
      }
    }

    context.editor.activeView.annotationsLayer.changed()
    return CallbackStatus.Stop
  },

  moveCommentThread (context: ToolContext, currentPoint: ImagePoint): CallbackStatus {
    const { commentThreadMoving, initialPoint } = this

    if (!commentThreadMoving || !initialPoint) { return CallbackStatus.Stop }

    context.editor.activeView.commentManager.setCommentThreadMoving(commentThreadMoving)

    const renderer = context
      .editor
      .activeView
      .renderManager
      .rendererFor('commentator') as CommentatorRenderer

    if (renderer) {
      const { topLeft, bottomRight } = commentThreadMoving.annotationBoundingBox as CommentVertices
      const center = new Point<'Image'>({
        x: topLeft.x + ((bottomRight.x - topLeft.x) / 2),
        y: topLeft.y + ((bottomRight.y - topLeft.y) / 2)
      })
      renderer.translate(commentThreadMoving, currentPoint.sub(center))
    }

    context.editor.activeView.annotationsLayer.changed()
    return CallbackStatus.Stop
  },

  activate (context: ToolContext) {
    setupWheelPanning(context)
    setupTouchPanning(context)
    setupWASDPanning(context)
    setupZoom(context)

    context.editor.selectCursor(EditorCursor.Commentator)

    // When activating the comment tool, we just deselect/unfocus all
    // the annotations as we are entering comment mode. */
    resetSelection(context)

    context.editor.registerCommand('commentator.cancel', () => {
      this.initialPoint = undefined
      context.editor.activeView.annotationsLayer.changed()
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
      view.renderManager.onRender((view) => this.onRender(context, view))
    )

    context.handles.push(...viewsOnRender)
  },

  /**
   * Handles the start of a mouse drag
   */
  onStart (context: ToolContext, event: CanvasEvent) {
    const canvasPoint = resolveEventPoint(event)
    if (!canvasPoint) { return }

    const imagePoint = context.editor.camera.canvasViewToImageView(canvasPoint)
    const vertex = context.editor.activeView.commentManager.findCommentThreadVertexAt(imagePoint)
    const commentThread =
      context.editor.activeView.commentManager.findTopCommentThreadAt(imagePoint)

    this.canvasPoint = canvasPoint
    this.initialPoint = imagePoint

    if (vertex) {
      context.editor.selectCursor(EditorCursor.Pointer)
      context.editor.deselectAllVertices()

      vertex.isSelected = true

      this.vertexMoving = vertex
      this.commentThreadMoving = commentThread
    } else if (commentThread) {
      context.editor.selectCursor(EditorCursor.Pointer)

      // only editable threads can be moved
      if (commentThread.isEditable) {
        context.editor.activeView.commentManager.setCommentThreadMoving(commentThread)

        this.commentThreadMoving = commentThread
      }

      // thread should be marked as selected either way
      context.editor.activeView.commentManager.selectCommentThread(commentThread)
    } else {
      context.editor.deselectAll()
      context.editor.deselectAllVertices()
    }

    context.editor.activeView.annotationsLayer.changed()
  },

  /**
   * Handles mouse move during drag
   */
  onMove (context: ToolContext, event: CanvasEvent) {
    const point = resolveEventPoint(event)
    if (!point) { return }

    this.canvasPoint = point

    const { initialPoint, vertexMoving, commentThreadMoving } = this
    const imagePoint = context.editor.camera.canvasViewToImageView(point)

    if (initialPoint && vertexMoving) { return this.moveVertex(context, imagePoint) }
    if (initialPoint && commentThreadMoving) { return this.moveCommentThread(context, imagePoint) }

    if (initialPoint) {
      this.cursorPoint = imagePoint
      context.editor.activeView.annotationsLayer.changed()
      return CallbackStatus.Stop
    }

    const vertex = context.editor.activeView.commentManager.findCommentThreadVertexAt(imagePoint)
    const commentThread =
      context.editor.activeView.commentManager.findTopCommentThreadAt(imagePoint)

    // we're hovering over some part of the comment, clear highlights in preparation
    // for setting new highlights
    if (vertex || commentThread) {
      context.editor.selectCursor(EditorCursor.Pointer)
    }

    if (vertex) {
      context.editor.unhighlightAllVertices()
      vertex.isHighlighted = true
    } else if (commentThread) {
      context.editor.activeView.commentManager.highlightCommentThread(commentThread)
    } else {
      context.editor.unhighlightAll()
      context.editor.selectCursor(EditorCursor.Commentator)
    }
    context.editor.activeView.annotationsLayer.changed()
  },

  /**
   * Handles the end of a mouse drag
   *
   * This will result in the comment thread being moved, or a new comment thread initialized
   */
  async onEnd (context: ToolContext, event: MouseEvent) {
    const { initialPoint, commentThreadMoving, vertexMoving } = this
    if (!initialPoint) { return this.reset(context) }

    const point = resolveEventPoint(event, true)
    if (point) {
      this.canvasPoint = point
    }

    if (!this.canvasPoint) { return }

    const canvasPoint = this.canvasPoint
    const imagePoint = context.editor.camera.canvasViewToImageView(canvasPoint)

    this.cursorPoint = imagePoint

    if (commentThreadMoving && euclideanDistance(initialPoint, canvasPoint) > 0) {
      // comment thread was moved, either directly, or by vertice

      const action = (vertexMoving)
        ? moveCommentThreadVertexAction(context.editor, commentThreadMoving)
        : moveCommentThreadAction(context.editor, commentThreadMoving)

      context.editor.actionManager.do(action)
    } else {
      // bounding box was drawn

      // straight lines can't be bounding boxes.
      const isStraightLine = imagePoint.x === initialPoint.x || imagePoint.y === initialPoint.y
      if (isStraightLine) {
        this.initialPoint = undefined
        this.cursorPoint = undefined
        context.editor.activeView.annotationsLayer.changed()
        return
      }

      // use the drawn bounding box to initiate a new comment thread
      const rect = new Rectangle(imagePoint, initialPoint)
      const commentBox: CommentVertices = {
        topLeft: rect.topLeft as EditableImagePoint,
        topRight: rect.topRight as EditableImagePoint,
        bottomLeft: rect.bottomLeft as EditableImagePoint,
        bottomRight: rect.bottomRight as EditableImagePoint
      }

      await context.editor.activeView.commentManager.createCommentThread(commentBox)
      context.editor.activeView.annotationsLayer.changed()
    }

    this.reset(context)
  },

  /**
   * Renders default new comment thread/selection rectangle.
   *
   * Runs when mouse drag started on a blank area of the canvas.
   */
  onRender (context: ToolContext, view: IView) {
    const { cursorPoint, initialPoint, commentThreadMoving, vertexMoving } = this
    if (!cursorPoint || !initialPoint) { return }

    // if we're moving a comment thread or its vertex,
    if (commentThreadMoving || vertexMoving) { return }

    const canvasCursorPoint = context.editor.camera.imageViewToCanvasView(cursorPoint)
    const canvasInitialPoint = context.editor.camera.imageViewToCanvasView(initialPoint)

    const ctx = view.annotationsLayer.context
    if (!ctx) { return }
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.strokeRect(
      canvasInitialPoint.x,
      canvasInitialPoint.y,
      canvasCursorPoint.x - canvasInitialPoint.x,
      canvasCursorPoint.y - canvasInitialPoint.y
    )
  },

  deactivate (context: ToolContext) {
    // When deactivating the comment tool, we just deselect/unfocus
    // all the comment thread as we are exiting comment mode. */
    resetSelection(context)
  },

  initialPoint: undefined,
  cursorPoint: undefined,
  commentThreadMoving: undefined,
  vertexMoving: undefined,

  reset () {
    this.initialPoint = undefined
    this.cursorPoint = undefined
    this.commentThreadMoving = undefined
    this.vertexMoving = undefined
  }
}
