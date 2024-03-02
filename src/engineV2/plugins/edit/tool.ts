import { cloneDeep } from 'lodash'

import { euclideanDistance } from '@/engineCommon/algebra'
import { CallbackStatus } from '@/engineCommon/callbackHandler'
import { EditableImagePoint, ImagePoint } from '@/engineCommon/point'
import { EditorCursor } from '@/engineV2/EditorCursor'
import { restoreAllJointsAction, updateAnnotationData } from '@/engineV2/actions'
import { SharedToolState, Tool, ToolContext } from '@/engineV2/managers'
import { FeatureFlagsManager } from '@/engineV2/managers/featureFlagsManager'
import { Annotation, AnnotationData } from '@/engineV2/models/annotation'
import {
  setupPrimaryButtonPanning,
  setupTouchPanning,
  setupWASDPanning,
  setupWheelPanning,
  setupZoom
} from '@/engineV2/plugins/mixins'
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
   * Gives panning tool the way to define when it's active
   *
   * For active panning, we should disable annotation detection
   * under the cursor for performance purposes
   */
  sharedState: SharedToolState = {
    isPanning: false
  }

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
    context.editor.toolManager.deactivateToolOption(toolOptionId)
  }

  deactivateToolOptions (context: ToolContext) {
    context.editor.store.commit('ui/SET_WORKVIEW_OVERLAY_TEXT', null)
    context.editor.toolManager.deactivateToolOptions()
  }

  activate (context: ToolContext) {
    setupWheelPanning(context)
    setupTouchPanning(context)
    setupWASDPanning(context)
    setupZoom(context)

    context.editor.registerCommand('edit_tool.restore_joints', () => {
      const { selectedAnnotation } = context.editor.activeView.annotationManager
      if (!selectedAnnotation) { return }
      if (selectedAnnotation.type !== 'skeleton') { return }

      const action = restoreAllJointsAction(context.editor.activeView, selectedAnnotation)
      context.editor.actionManager.do(action)

      if (FeatureFlagsManager.isOffLayerV2) {
        context.editor.activeView.annotationsLayer.changed()
      }
      return CallbackStatus.Stop
    })

    context.editor.registerCommand('edit_tool.activate_polygon_merge', () => {
      if (context.editor.activeView.isLoading) { return }
      context.editor.toolManager.activateToolOption('polygon_merge')
      const { selectedAnnotation } = context.editor.activeView.annotationManager
      if (selectedAnnotation?.type === 'polygon') {
        context.editor.store.commit('ui/SET_WORKVIEW_OVERLAY_TEXT', 'SELECT AN ANNOTATION TO MERGE')
      }
    })

    context.editor.registerCommand('edit_tool.activate_polygon_subtract', () => {
      if (context.editor.activeView.isLoading) { return }
      context.editor.toolManager.activateToolOption('polygon_subtract')
      const { selectedAnnotation } = context.editor.activeView.annotationManager
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
    setupPrimaryButtonPanning(context, this.sharedState)
  }

  onStart (context: ToolContext, event: CanvasEvent): void | CallbackStatus {
    const canvasPoint = resolveEventPoint(event)
    if (!canvasPoint) { return }

    const imagePoint = context.editor.activeView.camera.canvasViewToImageView(canvasPoint)
    let annotation

    if (FeatureFlagsManager.isOnLayerV2) {
      const itemId = context.editor.activeView.annotationsLayer.hitItemRegion(imagePoint)
      if (!itemId) {
        context.editor.activeView.annotationManager.cachedDeselectAllAnnotations()
        this.deactivateToolOptions(context)
        return
      }

      annotation = context.editor.activeView.annotationManager.getAnnotation(itemId)
    } else {
      annotation = context.editor.activeView.annotationManager.findTopAnnotationAt(imagePoint)
    }

    this.initialMouseDownPosition = imagePoint
    this.previousMouseMovePosition = imagePoint

    if (!annotation) {
      if (FeatureFlagsManager.isOnLayerV2) {
        context.editor.activeView.annotationManager.cachedDeselectAllAnnotations()
      } else {
        context.editor.activeView.annotationManager.deselectAllAnnotations()
      }
      this.deactivateToolOptions(context)
      if (FeatureFlagsManager.isOffLayerV2) {
        context.editor.activeView.annotationsLayer.changed()
      }
      return
    }

    if (annotation.isSelected && !context.editor.activeView.readonly) {
      this.deactivateToolOptions(context)

      this.annotationMoving =
        context.editor.activeView.annotationManager.getAnnotation(annotation.id)

      if (this.annotationMoving) {
        this.initialAnnotationData = cloneDeep(this.annotationMoving.data)
      }
      const vertex = context.editor.activeView.annotationManager.findAnnotationVertexAt(imagePoint)
      if (vertex) {
        context.editor.activeView.deselectAllVertices()
        vertex.isSelected = true
      }
      this.vertexMoving = vertex
    } else {
      const { selectedAnnotation } = context.editor.activeView.annotationManager
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
      context.editor
        .activeView
        .annotationManager
        .deselectAllAnnotations()
      context.editor
        .activeView
        .annotationManager
        .unhighlightAllAnnotations()
      context.editor
        .activeView
        .annotationManager
        .highlightAnnotation(annotation.id)
      context.editor
        .activeView
        .annotationManager
        .selectAnnotation(annotation.id)
    }

    if (FeatureFlagsManager.isOnLayerV2) {
      context.editor.activeView.annotationsLayer.getItem(annotation.id)?.changed()
    } else {
      context.editor.activeView.annotationsLayer.changed()
    }
    context.editor.selectCursor(EditorCursor.Edit)
    return CallbackStatus.Stop
  }

  onMove (context: ToolContext, event: CanvasEvent): void | CallbackStatus {
    // Continue status cause we have panning declaration tool an the end
    if (FeatureFlagsManager.isOnLayerV2 && this.sharedState.isPanning) {
      return CallbackStatus.Continue
    }
    if (!context.editor.activeView.hitTarget(event)) {
      return CallbackStatus.Stop
    }

    const canvasPoint = resolveEventPoint(event)
    if (!canvasPoint) { return }

    const imagePoint = context.editor.activeView.camera.canvasViewToImageView(canvasPoint)
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
        if (FeatureFlagsManager.isOnLayerV2) {
          context.editor.activeView.annotationsLayer.getItem(annotationMoving.id)?.changed()
        }
      }
      requestRepaint = true
    } else if (previousMouseMovePosition && annotationMoving) {
      // already moving annotation
      context.editor.selectCursor(EditorCursor.Move)
      translatePath(context.editor, annotationMoving, imagePoint.sub(previousMouseMovePosition))
      annotationMoving.path2D = undefined
      annotationMoving.centroid = undefined
      if (FeatureFlagsManager.isOnLayerV2) {
        context.editor.activeView.annotationsLayer.getItem(annotationMoving.id)?.changed()
      }
      requestRepaint = true
    } else {
      let annotation

      if (FeatureFlagsManager.isOnLayerV2) {
        const itemId = context.editor.activeView.annotationsLayer.hitItemRegion(imagePoint)
        if (!itemId) {
          context.editor.selectCursor(EditorCursor.Move)
          context.editor.activeView.annotationManager.cachedUnhighlightAllAnnotations()
          return
        }

        annotation = context.editor.activeView.annotationManager.getAnnotation(itemId)
      } else {
        annotation = context.editor.activeView.annotationManager.findTopAnnotationAt(imagePoint)
      }
      const annotationWithVertex = context.editor.activeView.annotationManager
        .findAnnotationWithVertexAt(imagePoint)
      const vertex = annotationWithVertex?.vertex

      if (vertex) {
        // on vertex hover set annotation as well
        annotation = annotationWithVertex.annotation
      }

      if (annotation || vertex) { context.editor.selectCursor(EditorCursor.Edit) }

      const highlightedVertices = context.editor.activeView.annotationManager.highlightedVertices
      if (
        !(highlightedVertices.length === 0 ||
          (vertex && highlightedVertices.length === 1 && highlightedVertices[0] === vertex)
        )
      ) {
        context.editor.activeView.unhighlightAllVertices()
        requestRepaint = true
      }

      if (vertex) {
        if (!vertex.isHighlighted) {
          vertex.isHighlighted = true
          requestRepaint = true
          // Highlights annotation as well as its vertex
          if (annotation && !annotation.isHighlighted) {
            context.editor.activeView.annotationManager.highlightAnnotation(annotation.id)
          }
        }
      } else if (annotation) {
        if (!annotation.isHighlighted) {
          context.editor.activeView.annotationManager.highlightAnnotation(annotation.id)
          requestRepaint = true
        }
      } else {
        if (context.editor.activeView.annotationManager.highlightedAnnotations.length > 0) {
          if (FeatureFlagsManager.isOnLayerV2) {
            context.editor.activeView.annotationManager.cachedUnhighlightAllAnnotations()
          } else {
            context.editor.activeView.unhighlightAll()
          }
          requestRepaint = true
        }
        context.editor.selectCursor(EditorCursor.Move)
      }
    }

    this.previousMouseMovePosition = imagePoint

    if (requestRepaint && FeatureFlagsManager.isOffLayerV2) {
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
      context.editor.activeView,
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
