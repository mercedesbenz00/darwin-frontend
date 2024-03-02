import { euclideanDistance } from '@/engineCommon/algebra'
import { CanvasPoint, ImagePoint } from '@/engineCommon/point'
import { EditorCursor } from '@/engineV2/EditorCursor'
import { addOrUpdateSubAnnotation } from '@/engineV2/actions'
import { calcCentroid, drawVector, drawVectorV2 } from '@/engineV2/graphics'
import { SubAnnotationTool, ToolContext } from '@/engineV2/managers'
import { FeatureFlagsManager } from '@/engineV2/managers/featureFlagsManager'
import { Annotation, isVideoAnnotation, isImageAnnotation } from '@/engineV2/models/annotation'
import {
  setupPrimaryButtonPanning,
  setupTouchPanning,
  setupWASDPanning,
  setupZoom
} from '@/engineV2/plugins/mixins'
import { PluginContext } from '@/engineV2/types'
import { calcCentroidPoint } from '@/engineV2/utils'
import { View } from '@/engineV2/views'
import { CanvasEvent, resolveEventPoint } from '@/utils/touch'

import { DirectionalVector } from './types'

interface DirectionalVectorTool extends SubAnnotationTool {
  initialPoint?: CanvasPoint,
  cursorPoint?: CanvasPoint,
  existingDirectionalVector?: Annotation,
  onMove: (context: ToolContext, event: CanvasEvent) => void
  onEnd: (context: ToolContext, event: CanvasEvent) => void
  draw: (view: View) => void
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
    if (FeatureFlagsManager.isOnLayerV2) {
      this.draw(context.editor.activeView)
    } else {
      context.editor.activeView.annotationsLayer.changed()
    }
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
          editor.activeView.camera.canvasViewToImageView(this.cursorPoint),
          editor.activeView.camera.canvasViewToImageView(this.initialPoint)
        )
      }
      const annotation = editor.activeView.annotationManager.initializeSubAnnotation(
        'directional_vector',
        this.masterAnnotation,
        directionalVector
      )

      if (!annotation) { return }

      const action = addOrUpdateSubAnnotation(editor.activeView, annotation, this.masterAnnotation)
      editor.actionManager.do(action)

      this.existingDirectionalVector = annotation
      this.reset(context)
      if (FeatureFlagsManager.isOnLayerV2) {
        this.draw(context.editor.activeView)
      } else {
        context.editor.activeView.annotationsLayer.changed()
      }
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

      const subs = context.editor.activeView.annotationManager.inferVideoSubAnnotations(annotation)
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

    if (FeatureFlagsManager.isOnLayerV2) {
      this.draw(context.editor.activeView)
    } else {
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

          const canvasCentroid = calcCentroidPoint(view, this.masterAnnotation)
          if (!canvasCentroid) { return }

          const ctx = view.annotationsLayer.context
          if (!ctx) { return }

          const centroid = view.camera.canvasViewToImageView(canvasCentroid)
          drawVector(
            view.camera,
            ctx,
            centroid,
            vector,
            color,
            context.editor.activeView.imageFilter
          )
        })
      )

      context.handles.push(...viewsOnRender)

      context.editor.activeView.annotationsLayer.changed()
    }
  },
  deactivate (context: PluginContext) {
    if (this.existingDirectionalVector) {
      this.existingDirectionalVector.show()
    }
    this.masterAnnotation = null
    if (FeatureFlagsManager.isOnLayerV2) {
      this.draw(context.editor.activeView)
    } else {
      context.editor.activeView.annotationsLayer.changed()
    }
    context.editor.toolManager.activatePreviousToolEntry()
  },
  draw (view: View): void {
    if (!(this.initialPoint && this.cursorPoint && this.masterAnnotation)) { return }

    const color = { r: 255, g: 255, b: 255, a: 1.0 }
    const vector = {
      angle: Math.atan2(
        this.cursorPoint.y - this.initialPoint.y,
        this.cursorPoint.x - this.initialPoint.x
      ),
      length: euclideanDistance(
        this.cursorPoint,
        this.initialPoint
      )
    }

    let centroid: ImagePoint
    if (isVideoAnnotation(this.masterAnnotation)) {
      const { data: annotationData } = this.masterAnnotation.inferVideoData(view)
      centroid = calcCentroid(annotationData.path)
    } else {
      if (!isImageAnnotation(this.masterAnnotation)) {
        throw new Error('Annotation is inferred as neither image nor video annotation')
      }
      centroid = calcCentroid(this.masterAnnotation.data.path)
    }

    const canvasCentroid = view.camera.imageViewToCanvasView(centroid)

    if (!canvasCentroid) {
      console.error("Can't calculate centroid (canvas view)!")
      return
    }

    drawVectorV2(
      fn => view.annotationsLayer.draw(fn),
      view.camera,
      canvasCentroid,
      vector,
      color,
      view.imageFilter,
      1
    )
  },
  reset (context: ToolContext) {
    this.initialPoint = undefined
    this.cursorPoint = undefined
    this.masterAnnotation = null
    if (FeatureFlagsManager.isOnLayerV2) {
      context.editor.activeView.annotationsLayer.draw()
    }
  }
}
