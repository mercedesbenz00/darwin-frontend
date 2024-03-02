import { EditorCursor } from '@/engine/EditorCursor'
import { addOrUpdateSubAnnotation } from '@/engine/actions'
import { PluginContext } from '@/engine/editor'
import { drawVector } from '@/engine/graphics'
import { SubAnnotationTool, ToolContext } from '@/engine/managers'
import {
  Annotation,
  isVideoAnnotation,
  isImageAnnotation
} from '@/engine/models'
import {
  setupPrimaryButtonPanning,
  setupTouchPanning,
  setupWASDPanning,
  setupZoom
} from '@/engine/plugins/mixins'
import { calcCentroidPoint } from '@/engine/utils'
import { euclideanDistance } from '@/engineCommon/algebra'
import { CanvasPoint } from '@/engineCommon/point'
import { CanvasEvent, resolveEventPoint } from '@/utils/touch'

import { DirectionalVector } from './types'

interface DirectionalVectorTool extends SubAnnotationTool {
  initialPoint?: CanvasPoint,
  cursorPoint?: CanvasPoint,
  existingDirectionalVector?: Annotation,
  onMove: (context: ToolContext, event: CanvasEvent) => void
  onEnd: (context: ToolContext, event: CanvasEvent) => void
}

export const tool: DirectionalVectorTool = {
  initialPoint: undefined,
  cursorPoint: undefined,
  masterAnnotation: null,
  existingDirectionalVector: undefined,

  onMove (context: ToolContext, event: CanvasEvent): void {
    const point = resolveEventPoint(event)
    if (!point) { return }

    this.cursorPoint = point
    context.editor.activeView.annotationsLayer.changed()
  },

  onEnd (context: ToolContext, event: CanvasEvent): void {
    if (this.initialPoint && this.masterAnnotation) {
      const { editor } = context
      const point = resolveEventPoint(event)
      if (!point) { return }

      this.cursorPoint = point
      const directionalVector: DirectionalVector = {
        angle: Math.atan2(
          this.cursorPoint.y - this.initialPoint.y,
          this.cursorPoint.x - this.initialPoint.x
        ),
        length: euclideanDistance(
          editor.camera.canvasViewToImageView(this.cursorPoint),
          editor.camera.canvasViewToImageView(this.initialPoint)
        )
      }
      const annotation = editor.initializeSubAnnotation(
        'directional_vector',
        this.masterAnnotation,
        directionalVector
      )

      if (!annotation) { return }

      const action = addOrUpdateSubAnnotation(editor, annotation, this.masterAnnotation)
      editor.actionManager.do(action)

      this.existingDirectionalVector = annotation
      this.reset(context)
      context.editor.activeView.annotationsLayer.changed()
    }
    context.editor.toolManager.activatePreviousToolEntry()
  },

  selectMasterAnnotation (context: PluginContext, annotation: Annotation) {
    this.masterAnnotation = annotation

    let existingDirectionalVector
    if (isVideoAnnotation(annotation)) {
      const { data: annotationData } = annotation.inferVideoData(context.editor.activeView)
      this.initialPoint = calcCentroidPoint(
        context.editor.activeView,
        annotation.shallowClone({ data: annotationData })
      )

      const subs = context.editor.inferVideoSubAnnotations(annotation)
      existingDirectionalVector =
        subs.find(ann => ann.type === 'directional_vector' && ann.parentId === annotation.id)
    } else {
      if (!isImageAnnotation(annotation)) {
        throw new Error('Annotation is inferred as neither image nor video annotation')
      }
      this.initialPoint = calcCentroidPoint(context.editor.activeView, annotation)
      existingDirectionalVector = annotation.subAnnotations
        .find(ann => ann.type === 'directional_vector' && ann.parentId === annotation.id)
    }

    if (existingDirectionalVector) {
      existingDirectionalVector.hide()
    }
    this.existingDirectionalVector = existingDirectionalVector
  },
  activate (context: PluginContext) {
    setupPrimaryButtonPanning(context)
    setupTouchPanning(context)
    setupWASDPanning(context)
    setupZoom(context)

    context.editor.selectCursor(EditorCursor.Pointer)

    context.handles.push(...context.editor.onMouseMove(event => this.onMove(context, event)))
    context.handles.push(...context.editor.onTouchMove(event => this.onMove(context, event)))
    context.handles.push(...context.editor.onMouseUp(event => this.onEnd(context, event)))
    context.handles.push(...context.editor.onTouchEnd(event => this.onEnd(context, event)))

    const viewsOnRender = context.editor.viewsList.map(view =>
      view.renderManager.onRender((view) => {
        if (!(this.initialPoint && this.cursorPoint && this.masterAnnotation)) { return }

        const color = { r: 255, g: 255, b: 255, a: 1.0 }
        const vector = {
          angle: Math.atan2(
            this.cursorPoint.y - this.initialPoint.y,
            this.cursorPoint.x - this.initialPoint.x
          ),
          length: euclideanDistance(
            view.camera.canvasViewToImageView(this.cursorPoint),
            view.camera.canvasViewToImageView(this.initialPoint)
          )
        }

        const canvasCentroid = calcCentroidPoint(context.editor.activeView, this.masterAnnotation)
        if (!canvasCentroid) { return }
        
        const centroid = context.editor.camera.canvasViewToImageView(canvasCentroid)
        drawVector(view, centroid, vector, color, context.editor.activeView.imageFilter)
      })
    )

    context.handles.push(...viewsOnRender)

    context.editor.activeView.annotationsLayer.changed()
  },
  deactivate (context: PluginContext) {
    if (this.existingDirectionalVector) {
      this.existingDirectionalVector.show()
    }
    this.masterAnnotation = null
    context.editor.activeView.annotationsLayer.changed()
    context.editor.toolManager.activatePreviousToolEntry()
  },
  reset () {
    this.initialPoint = undefined
    this.cursorPoint = undefined
    this.masterAnnotation = null
  }
}
