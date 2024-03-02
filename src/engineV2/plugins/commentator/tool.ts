import { euclideanDistance } from '@/engineCommon/algebra'
import { CallbackStatus } from '@/engineCommon/callbackHandler'
import { CanvasPoint, EditableImagePoint, Point } from '@/engineCommon/point'
import { Rectangle } from '@/engineCommon/rectangle'
import { EditorCursor } from '@/engineV2/EditorCursor'
import { moveCommentThreadVertexAction, moveCommentThreadAction } from '@/engineV2/actions'
import { EditorCommentThread } from '@/engineV2/commentHelpers'
import { Tool, ToolContext } from '@/engineV2/managers'
import {
  setupTouchPanning,
  setupWASDPanning,
  setupWheelPanning,
  setupZoom
} from '@/engineV2/plugins/mixins'
import { View } from '@/engineV2/views'
import { CanvasEvent, resolveEventPoint } from '@/utils/touch'

class InvalidStateError extends Error {
  constructor () {
    super('Invalid state')
  }
}

enum State {
  Inactive = 'Inactive',
  Initial = 'Initial',
  DownOverVertex = 'DownOverVertex',
  DownOverThread = 'DownOverThread',
  DownCreating = 'DownCreating',
  MovingVertex = 'MovingVertex',
  MovingThread = 'MovingThread',
  Creating = 'Creating',
  HoveringThread = 'HoveringThread',
  HoveringVertex = 'HoveringVertex'
}

// change to true to show some console debug messages
const DEBUG = process.env.VUE_APP_DEBUG === 'yes'

const setState = (tool: CommentatorTool, state: State): void => {
  DEBUG && console.warn(`comentator state transition: ${tool.state} -> ${state}`)
  tool.state = state
}

interface CommentatorTool extends Tool {
  /**
   * Point when mousedown happened
   */
  initialPoint?: CanvasPoint
  /**
   * Current mouse point
   */
  currentPoint?: CanvasPoint

  /**
   * Holds reference to the vertex currently being moved
   */
  vertexBeingMoved?: EditableImagePoint

  /**
   * Current state of the state machine
   */
  state: State

  onStart (context: ToolContext, event: CanvasEvent): CallbackStatus
  onMove (context: ToolContext, event: CanvasEvent): CallbackStatus
  onEnd (context: ToolContext, event: CanvasEvent): CallbackStatus
  onRender (context: ToolContext, view: View): void

  reset (): void
}

const isValidBox =
  (pointA: { x: number, y: number }, pointB: { x: number, y: number }): boolean => {
    const isStraightLine = pointA.x === pointB.x || pointA.y === pointB.y
    return !isStraightLine
  }

const resolveDistanceMoved = (tool: CommentatorTool): number => {
  const { currentPoint, initialPoint } = tool
  if (!currentPoint || !initialPoint) { throw new InvalidStateError() }
  return euclideanDistance(currentPoint, initialPoint)
}

const resetMovedVertex = (tool: CommentatorTool): void => {
  if (!tool.vertexBeingMoved) { return }
  tool.vertexBeingMoved.isHighlighted = false
  tool.vertexBeingMoved.isSelected = false
  tool.vertexBeingMoved = undefined
}

// State.HoveringThread -> State.Initial
// State.HoveringVertex -> State.Initial
// State.Creating -> State.Initial
// State.MovingThread -> State.Initial
// State.MovingVertex -> State.Initial
const enterInitial = (tool: CommentatorTool, context: ToolContext): void => {
  context.editor.selectCursor(EditorCursor.Commentator)
  resetMovedVertex(tool)

  context.editor.activeView.commentLayer.changed()
  setState(tool, State.Initial)
}

const enterInactive = (tool: CommentatorTool, context: ToolContext): void => {
  const commentManager = context.editor.activeView.commentManager
  commentManager.closeSelectedThread()
  enterInitial(tool, context)
  setState(tool, State.Inactive)
}

const leaveHovering = (tool: CommentatorTool, context: ToolContext): void => {
  const commentManager = context.editor.activeView.commentManager
  commentManager.unhighlightCommentThread()
  resetMovedVertex(tool)

  enterInitial(tool, context)
}

// State.Initial -> State.HoveringThread
const enterHoveringThread = (
  tool: CommentatorTool,
  context: ToolContext,
  thread: EditorCommentThread
): void => {
  resetMovedVertex(tool)

  const commentManager = context.editor.activeView.commentManager
  commentManager.highlightCommentThread(thread)

  context.editor.activeView.commentLayer.changed()
  setState(tool, State.HoveringThread)
}

// State.HoveringThread -> State.DownOverThread
const enterDownOverThread = (tool: CommentatorTool, context: ToolContext): void => {
  context.editor.selectCursor(EditorCursor.Pointer)
  const commentManager = context.editor.activeView.commentManager
  const thread = commentManager.highlightedCommentThread
  if (!thread) { throw new InvalidStateError() }
  commentManager.selectCommentThread(thread)
  setState(tool, State.DownOverThread)
}

// State.DownOverThread -> (move distance > x)-> State.MovingThread
const enterMovingThread = (tool: CommentatorTool): void => {
  setState(tool, State.MovingThread)
}

const completeMovingThread = (tool: CommentatorTool, context: ToolContext): void => {
  const { currentPoint, initialPoint } = tool
  if (!currentPoint || !initialPoint) { throw new InvalidStateError() }

  const commentManager = context.editor.activeView.commentManager
  if (!commentManager.selectedCommentThread) { throw new InvalidStateError() }

  const action = moveCommentThreadAction(context.editor, commentManager.selectedCommentThread)
  context.editor.actionManager.do(action)

  setState(tool, State.Initial)
}

// State.HoveringThread -> State.HoveringVertex
const enterHoveringVertex = (
  tool: CommentatorTool,
  context: ToolContext,
  vertex: EditableImagePoint
): void => {
  tool.vertexBeingMoved = vertex
  tool.vertexBeingMoved.isHighlighted = true
  context.editor.activeView.commentLayer.changed()
  setState(tool, State.HoveringVertex)
}

// State.HoveringVertex -> State.DownOverVertex
const enterDownOverVertex = (tool: CommentatorTool, context: ToolContext): void => {
  const vertex = tool.vertexBeingMoved
  if (!vertex) { throw new InvalidStateError() }
  vertex.isSelected = true
  context.editor.selectCursor(EditorCursor.Pointer)
  setState(tool, State.DownOverVertex)
}

// State.DownOverVertex -> (move distance > x)-> State.MovingVertex
const enterMovingVertex = (tool: CommentatorTool): void => {
  setState(tool, State.MovingVertex)
}

const completeMovingVertex = (tool: CommentatorTool, context: ToolContext): void => {
  const { currentPoint, initialPoint } = tool
  if (!currentPoint || !initialPoint) { throw new InvalidStateError() }

  if (!isValidBox(currentPoint, initialPoint)) { return }

  const commentManager = context.editor.activeView.commentManager
  const thread = commentManager.selectedCommentThread
  if (!thread) { throw new Error('Invalid commentator tool state') }

  const action = moveCommentThreadVertexAction(context.editor, thread)
  context.editor.actionManager.do(action)

  leaveHovering(tool, context)
}

// State.Initial -> State.DownCreating
const enterDownCreating = (tool: CommentatorTool, context: ToolContext): void => {
  context.editor.selectCursor(EditorCursor.Pointer)
  setState(tool, State.DownCreating)
}

// State.DownCreating -> (move distance > x)-> State.Creating
const enterCreating = (tool: CommentatorTool): void => {
  setState(tool, State.Creating)
}

// State.DownOverThread -> State.Open
// State.DownOverVertex -> State.Open
export const openThread = (tool: CommentatorTool, context: ToolContext): void => {
  context.editor.selectCursor(EditorCursor.Commentator)
  const commentManager = context.editor.activeView.commentManager

  if (!commentManager.highlightedCommentThread) {
    throw new InvalidStateError()
  }

  commentManager.selectCommentThread(commentManager.highlightedCommentThread)
  commentManager.openSelectedThread()
  setState(tool, State.Initial)
}

const completeCreating = (tool: CommentatorTool, context: ToolContext): void => {
  const { currentPoint, initialPoint } = tool
  if (!initialPoint || !currentPoint) { throw new InvalidStateError() }
  if (!isValidBox(initialPoint, currentPoint)) { return }

  const rect = new Rectangle(
    context.editor.activeView.camera.canvasViewToImageView(initialPoint),
    context.editor.activeView.camera.canvasViewToImageView(currentPoint)
  )

  const commentManager = context.editor.activeView.commentManager
  const thread = commentManager.initializeNewThread(
    rect.topLeft.x,
    rect.topLeft.y,
    rect.topRight.x - rect.topLeft.x,
    rect.bottomLeft.y - rect.topLeft.y
  )

  commentManager.highlightCommentThread(thread)
  commentManager.selectCommentThread(thread)
  commentManager.openSelectedThread()
  setState(tool, State.Initial)
}

// Happens in State.MovingThread, doesn't transition, but updates data
const moveThread = (tool: CommentatorTool, context: ToolContext): void => {
  const commentManager = context.editor.activeView.commentManager
  const thread = commentManager.selectedCommentThread
  if (!thread) { throw new InvalidStateError() }

  const { currentPoint, initialPoint } = tool
  if (!currentPoint || !initialPoint) { throw new InvalidStateError() }

  const oldCenter = new Point<'Image'>({
    x: thread.topLeft.x + ((thread.bottomRight.x - thread.topLeft.x) / 2),
    y: thread.topLeft.y + ((thread.bottomRight.y - thread.topLeft.y) / 2)
  })

  const currentImagePoint = context.editor.activeView.camera.canvasViewToImageView(currentPoint)
  const offset = currentImagePoint.sub(oldCenter)

  commentManager.moveBox(thread, offset)
  context.editor.activeView.commentLayer.changed()
}

export const moveVertex = (tool: CommentatorTool, context: ToolContext): void => {
  const commentManager = context.editor.activeView.commentManager
  const selectedCommentThread = commentManager.selectedCommentThread
  const { vertexBeingMoved, currentPoint } = tool
  if (!vertexBeingMoved || !selectedCommentThread || !currentPoint) {
    throw new InvalidStateError()
  }

  const currentImagePoint = context.editor.activeView.camera.canvasViewToImageView(currentPoint)

  commentManager.moveVertex(selectedCommentThread, vertexBeingMoved, currentImagePoint)
  vertexBeingMoved.x = currentImagePoint.x
  vertexBeingMoved.y = currentImagePoint.y

  context.editor.activeView.commentLayer.changed()
}

export const updateNewThreadBox = (tool: CommentatorTool, context: ToolContext): void => {
  context.editor.activeView.commentLayer.changed()
}

export const tool: CommentatorTool = {
  state: State.Inactive,

  initialPoint: undefined,
  currentPoint: undefined,
  vertexBeingMoved: undefined,

  activate (context: ToolContext) {
    setupWheelPanning(context)
    setupTouchPanning(context)
    setupWASDPanning(context)
    setupZoom(context)

    enterInitial(this, context)

    context.editor.selectCursor(EditorCursor.Commentator)

    context.editor.registerCommand('commentator.cancel', () => {
      enterInitial(this, context)
    })

    context.handles.push(...context.editor.onMouseDown(event => this.onStart(context, event)))
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
  onStart (context, event) {
    const eventPoint = resolveEventPoint(event)
    if (!eventPoint) { return CallbackStatus.Continue }

    this.initialPoint = eventPoint
    this.currentPoint = eventPoint

    if (this.state === State.Initial) {
      enterDownCreating(this, context)
      return CallbackStatus.Stop
    }

    if (this.state === State.HoveringThread) {
      enterDownOverThread(this, context)
      return CallbackStatus.Stop
    }

    if (this.state === State.HoveringVertex) {
      enterDownOverVertex(this, context)
      return CallbackStatus.Stop
    }

    return CallbackStatus.Continue
  },

  /**
   * Handles mouse move during drag
   */
  onMove (context, event) {
    const eventPoint = resolveEventPoint(event)
    if (!eventPoint) { return CallbackStatus.Continue }

    this.currentPoint = eventPoint

    const imagePoint = context.editor.activeView.camera.canvasViewToImageView(eventPoint)
    const commentManager = context.editor.activeView.commentManager

    if (this.state === State.DownCreating && resolveDistanceMoved(this) > 5) {
      enterCreating(this)
      return CallbackStatus.Stop
    }

    if (
      this.state === State.DownOverThread &&
      resolveDistanceMoved(this) > 5 &&
      commentManager.hihglightedCommentThreadIsEditable
    ) {
      enterMovingThread(this)
      return CallbackStatus.Stop
    }

    if (
      this.state === State.DownOverVertex &&
      resolveDistanceMoved(this) > 5 &&
      commentManager.hihglightedCommentThreadIsEditable
    ) {
      enterMovingVertex(this)
      return CallbackStatus.Stop
    }

    if (this.state === State.MovingThread) {
      moveThread(this, context)
      return CallbackStatus.Stop
    }

    if (this.state === State.MovingVertex) {
      moveVertex(this, context)
      return CallbackStatus.Stop
    }

    if (this.state === State.Creating) {
      updateNewThreadBox(this, context)
      return CallbackStatus.Stop
    }

    const vertex = commentManager.findCommentThreadVertexAt(imagePoint)
    const thread = commentManager.findTopCommentThreadAt(imagePoint)

    if (this.state === State.Initial && thread) {
      enterHoveringThread(this, context, thread)
      return CallbackStatus.Stop
    }

    if (this.state === State.HoveringThread && vertex) {
      enterHoveringVertex(this, context, vertex)
      return CallbackStatus.Stop
    }

    if (this.state === State.HoveringThread && !thread) {
      leaveHovering(this, context)
      return CallbackStatus.Stop
    }

    if (this.state === State.HoveringVertex && !vertex && !thread) {
      leaveHovering(this, context)
      return CallbackStatus.Stop
    }

    if (this.state === State.HoveringVertex && !vertex && thread) {
      enterHoveringThread(this, context, thread)
      return CallbackStatus.Stop
    }

    return CallbackStatus.Continue
  },

  /**
   * Handles the end of a mouse drag
   *
   * This will result in the comment thread being moved, or a new comment thread initialized
   */
  onEnd (context) {
    if (this.state === State.DownOverThread || this.state === State.DownOverVertex) {
      openThread(this, context)
      return CallbackStatus.Stop
    }

    if (this.state === State.DownCreating) {
      const commentManager = context.editor.activeView.commentManager
      commentManager.closeSelectedThread()
      commentManager.deselectCommentThread()
      context.editor.activeView.commentLayer.changed()
      enterInitial(this, context)
      return CallbackStatus.Stop
    }

    if (this.state === State.Creating) {
      completeCreating(this, context)
      return CallbackStatus.Stop
    }

    if (this.state === State.MovingVertex) {
      completeMovingVertex(this, context)
      return CallbackStatus.Stop
    }

    if (this.state === State.MovingThread) {
      completeMovingThread(this, context)
      return CallbackStatus.Stop
    }

    return CallbackStatus.Continue
  },

  /**
   * Renders default new comment thread/selection rectangle.
   *
   * Runs when mouse drag started on a blank area of the canvas.
   */
  onRender (context: ToolContext, view: View) {
    if (this.state !== State.Creating) { return }

    const { currentPoint, initialPoint } = this
    if (!currentPoint || !initialPoint) { return }

    const ctx = view.commentLayer.context
    if (!ctx) { return }
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.strokeRect(
      initialPoint.x,
      initialPoint.y,
      currentPoint.x - initialPoint.x,
      currentPoint.y - initialPoint.y
    )
  },

  deactivate (context: ToolContext) {
    enterInactive(tool, context)
  },

  reset () {
    this.initialPoint = undefined
    this.currentPoint = undefined
    this.vertexBeingMoved = undefined
  }

}
