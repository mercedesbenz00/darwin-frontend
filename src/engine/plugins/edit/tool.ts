import { cloneDeep } from 'lodash'

import { EditorCursor } from '@/engine/EditorCursor'
import { restoreAllJointsAction, updateAnnotationData } from '@/engine/actions'
import { Tool, ToolContext } from '@/engine/managers'
import { Annotation, AnnotationData } from '@/engine/models/annotation'
import {
  setupPrimaryButtonPanning,
  setupTouchPanning,
  setupWASDPanning,
  setupWheelPanning,
  setupZoom
} from '@/engine/plugins/mixins'
import { euclideanDistance } from '@/engineCommon/algebra'
import { CallbackStatus } from '@/engineCommon/callbackHandler'
import { EditableImagePoint, ImagePoint } from '@/engineCommon/point'
import { isLeftMouseButton } from '@/utils/mouse'
import { CanvasEvent, resolveEventPoint } from '@/utils/touch'

import {
  handlePolygonMerge,
  handlePolygonSubtract,
  translatePath,
  translateVertex
} from './utils'

type EditToolAfterMove = EditTool & {
  annotationMoving: Annotation,
  annotationData: AnnotationData,
  initialMouseDownPosition: EditableImagePoint
  previousMouseMovePosition: EditableImagePoint
}

class EditTool implements Tool {
  /**
   * Last known position of the mouse (on image)
   *
   * Constantly updates as mouse moves.
   */
  previousMouseMovePosition?: ImagePoint

  /**
   * Initial position of the mouse on mouse down (on image)
   *
   * Is set on mouse down and does not update as mouse moves.
   */
  initialMouseDownPosition?: ImagePoint

  /**
   * Holds reference to the annotation currently being moved (either as a whole, or by vertex)
   */
  annotationMoving?: Annotation

  /**
   * Copy of annotation data before movement started
   */
  initialAnnotationData?: AnnotationData

  /**
   * Holds reference to the vertex currently being moved
   */
  vertexMoving?: EditableImagePoint

  /**
   * Return an active tool option of current tool
   */
  activeToolOption (context: ToolContext) {
    const { currentTool: tool } = context.editor.toolManager
    if (!tool || tool.name !== 'edit_tool') { return null }

    const activeOption = (tool.toolConfig.toolOptions || []).find(option => option.active)
    if (!activeOption) { return null }

    return activeOption
  }

  deactivateToolOption (context: ToolContext, toolOptionId: string) {
    context.editor.store.commit('ui/SET_WORKVIEW_OVERLAY_TEXT', null)
    context.editor.deactivateToolOption(toolOptionId)
  }

  deactivateToolOptions (context: ToolContext) {
    context.editor.store.commit('ui/SET_WORKVIEW_OVERLAY_TEXT', null)
    context.editor.deactivateToolOptions()
  }

  activate (context: ToolContext) {
    setupWheelPanning(context)
    setupTouchPanning(context)
    setupWASDPanning(context)
    setupZoom(context)

    context.editor.registerCommand('edit_tool.restore_joints', () => {
      const { selectedAnnotation } = context.editor
      if (!selectedAnnotation) { return }
      if (selectedAnnotation.type !== 'skeleton') { return }

      const action = restoreAllJointsAction(context.editor, selectedAnnotation)
      context.editor.actionManager.do(action)

      context.editor.activeView.annotationsLayer.changed()
      return CallbackStatus.Stop
    })

    context.editor.registerCommand('edit_tool.activate_polygon_merge', () => {
      if (context.editor.loadedVideo) { return }
      context.editor.activateToolOption('polygon_merge')
      const { selectedAnnotation } = context.editor
      if (selectedAnnotation?.type === 'polygon') {
        context.editor.store.commit('ui/SET_WORKVIEW_OVERLAY_TEXT', 'SELECT AN ANNOTATION TO MERGE')
      }
    })

    context.editor.registerCommand('edit_tool.activate_polygon_subtract', () => {
      if (context.editor.loadedVideo) { return }
      context.editor.activateToolOption('polygon_subtract')
      const { selectedAnnotation } = context.editor
      if (selectedAnnotation?.type === 'polygon') {
        context.editor.store.commit(
          'ui/SET_WORKVIEW_OVERLAY_TEXT',
          'SELECT AN ANNOTATION TO SUBTRACT'
        )
      }
    })

    context.handles.push(...context.editor.onMouseDown(e => {
      if (!isLeftMouseButton(e)) { return CallbackStatus.Continue }
      return this.onStart(context, e)
    }))
    context.handles.push(...context.editor.onTouchStart(e => this.onStart(context, e)))
    context.handles.push(...context.editor.onMouseMove(e => this.onMove(context, e)))
    context.handles.push(...context.editor.onTouchMove(e => this.onMove(context, e)))
    context.handles.push(...context.editor.onMouseUp(() => this.onEnd(context)))
    context.handles.push(...context.editor.onTouchEnd(() => this.onEnd(context)))

    // goes at the end, since the tool can also be used to drag an annotation or a vertex
    // putting it at the ed mans the tool hadlers fire off first
    setupPrimaryButtonPanning(context)
  }

  onStart (context: ToolContext, event: CanvasEvent): void | CallbackStatus {
    const canvasPoint = resolveEventPoint(event)
    if (!canvasPoint) { return }

    const imagePoint = context.editor.camera.canvasViewToImageView(canvasPoint)
    const annotation = context.editor.findTopAnnotationAt(imagePoint)

    this.initialMouseDownPosition = imagePoint
    this.previousMouseMovePosition = imagePoint

    if (!annotation) {
      context.editor.deselectAllAnnotations()
      this.deactivateToolOptions(context)
      context.editor.activeView.annotationsLayer.changed()
      return
    }

    if (annotation.isSelected) {
      this.deactivateToolOptions(context)

      this.annotationMoving =
        context.editor.activeView.annotations.find(a => a.id === annotation?.id)

      if (this.annotationMoving) {
        this.initialAnnotationData = cloneDeep(this.annotationMoving.data)
      }
      const vertex = context.editor.findAnnotationVertexAt(imagePoint)
      if (vertex) {
        context.editor.deselectAllVertices()
        vertex.isSelected = true
      }
      this.vertexMoving = vertex
    } else {
      const { selectedAnnotation } = context.editor
      const activeToolOption = this.activeToolOption(context)
      if (
        activeToolOption &&
        annotation.type === 'polygon' &&
        selectedAnnotation?.type === 'polygon'
      ) {
        if (activeToolOption.id === 'polygon_merge') {
          handlePolygonMerge(selectedAnnotation, annotation, context)
          this.deactivateToolOption(context, 'polygon_merge')
          return CallbackStatus.Stop
        }

        if (activeToolOption.id === 'polygon_subtract') {
          handlePolygonSubtract(selectedAnnotation, annotation, context)
          this.deactivateToolOption(context, 'polygon_subtract')
          return CallbackStatus.Stop
        }
      }
      this.deactivateToolOptions(context)

      // deselect/unhighlight to avoid copy/pasting the wrong annotation
      context.editor.deselectAllAnnotations()
      context.editor.unhighlightAllAnnotations()
      annotation.highlight()
      annotation.select()
    }

    context.editor.activeView.annotationsLayer.changed()
    context.editor.selectCursor(EditorCursor.Edit)
    return CallbackStatus.Stop
  }

  onMove (context: ToolContext, event: CanvasEvent) {
    if (!context.editor.activeView.hitTarget(event)) {
      return CallbackStatus.Stop
    }

    const canvasPoint = resolveEventPoint(event)
    if (!canvasPoint) { return }

    const imagePoint = context.editor.camera.canvasViewToImageView(canvasPoint)
    const { annotationMoving, previousMouseMovePosition, vertexMoving } = this
    // Only try to repaint if something has changed
    let requestRepaint = false

    if (previousMouseMovePosition && vertexMoving) {
      // already moving vertex
      translateVertex(
        context.editor,
        vertexMoving,
        imagePoint.sub(previousMouseMovePosition),
        this,
        event
      )
      if (annotationMoving) {
        annotationMoving.path2D = undefined
        annotationMoving.centroid = undefined
      }
      requestRepaint = true
    } else if (previousMouseMovePosition && annotationMoving) {
      // already moving annotation
      context.editor.selectCursor(EditorCursor.Move)
      translatePath(context.editor, annotationMoving, imagePoint.sub(previousMouseMovePosition))
      annotationMoving.path2D = undefined
      annotationMoving.centroid = undefined
      requestRepaint = true
    } else {
      const annotation = context.editor.findTopAnnotationAt(imagePoint)
      const vertex = context.editor.findAnnotationVertexAt(imagePoint)

      if (annotation || vertex) { context.editor.selectCursor(EditorCursor.Edit) }

      const highlightedVertices = context.editor.highlightedVertices
      if (
        !(highlightedVertices.length === 0 ||
          (vertex && highlightedVertices.length === 1 && highlightedVertices[0] === vertex)
        )
      ) {
        context.editor.unhighlightAllVertices()
        requestRepaint = true
      }

      if (vertex) {
        if (!vertex.isHighlighted) {
          vertex.isHighlighted = true
          requestRepaint = true
        }
      } else if (annotation) {
        if (!annotation.isHighlighted) {
          annotation.highlight()
          requestRepaint = true
        }
      } else {
        if (context.editor.highlightedAnnotations.length > 0) {
          context.editor.unhighlightAll()
          requestRepaint = true
        }
        context.editor.selectCursor(EditorCursor.Move)
      }
    }

    this.previousMouseMovePosition = imagePoint

    if (requestRepaint) {
      context.editor.activeView.annotationsLayer.changed()
    }
  }

  onEnd (context: ToolContext): void {
    if (this.didMove()) { this.handleMoveEnd(context) }
    this.reset(context)
  }

  /**
   * Type guard to ensure the edit tool instance has all the required
   * props to handle dragging of an annotation
   */
  didMove (): this is EditToolAfterMove {
    return !!this.annotationMoving && this.getCurrentDistanceMoved() > 0
  }

  /**
   * Handle the end of moving a vertex or annotation
   */
  handleMoveEnd (context: ToolContext): void {
    if (!this.didMove()) { return }
    const { annotationMoving, initialAnnotationData } = this
    if (!initialAnnotationData) { return }
    const action = updateAnnotationData(
      context.editor,
      annotationMoving,
      initialAnnotationData,
      annotationMoving.data
    )
    context.editor.actionManager.do(action)
  }

  /**
   * Returns total distance moved within the current mouse down -> move -> up sequence
   */
  getCurrentDistanceMoved (): number {
    const { previousMouseMovePosition, initialMouseDownPosition } = this
    if (!initialMouseDownPosition || !previousMouseMovePosition) { return 0 }
    return euclideanDistance(initialMouseDownPosition, previousMouseMovePosition)
  }

  deactivate (context: ToolContext): void {
    this.deactivateToolOptions(context)
  }

  /**
   * Reset state on mouse up, so the next mouse down -> move -> up cycle can be handled
   */
  reset (context: ToolContext): void {
    this.previousMouseMovePosition = undefined
    this.initialMouseDownPosition = undefined
    this.annotationMoving = undefined
    this.initialAnnotationData = undefined
    this.vertexMoving = undefined
    this.deactivateToolOptions(context)
  }
}

export const tool = new EditTool()
