import { v4 as uuidv4 } from 'uuid'

import { CallbackStatus } from '@/engineCommon/callbackHandler'
import { CanvasPoint, Point } from '@/engineCommon/point'
import { Rectangle } from '@/engineCommon/rectangle'
import { EditorCursor } from '@/engineV2/EditorCursor'
import { Editor } from '@/engineV2/editor'
import { drawPath, drawPathV2 } from '@/engineV2/graphics'
import { drawGuideLines } from '@/engineV2/graphics/drawGuideLines'
import { Tool, ToolContext } from '@/engineV2/managers'
import { FeatureFlagsManager } from '@/engineV2/managers/featureFlagsManager'
import { Annotation, AnnotationData } from '@/engineV2/models/annotation'
import { getPath as getBoundingBoxPath } from '@/engineV2/plugins/boundingBox/BoundingBoxRenderer'
import {
  setupTouchPanning,
  setupWASDPanning,
  setupWheelPanning,
  setupZoom
} from '@/engineV2/plugins/mixins'
import { View } from '@/engineV2/views'
import { AnnotationTypeName } from '@/store/types'
import { parseRGBA } from '@/utils'
import { isLeftMouseButton } from '@/utils/mouse'
import { CanvasEvent, resolveEventPoint } from '@/utils/touch'

import { GRAPH_ANNOTATION_TYPE, STRING_ANNOTATION_TYPE } from './types'

type StringParams = {
  id: string
  classId: number
  type: AnnotationTypeName
  data: AnnotationData
}

interface FieldTool extends Tool {
  initialPoint?: CanvasPoint
  cursorPoint?: CanvasPoint
  keyStringData?: AnnotationData
  selectedAnnotations: Annotation[]
  saving: Boolean

  onStart: (context: ToolContext, event: CanvasEvent) => void
  onMove: (context: ToolContext, event: CanvasEvent) => void
  onEnd: (context: ToolContext, event: CanvasEvent) => void
  draw: (view: View) => void
}

const annotationsWithinBox = (
  editor: Editor,
  annotations: Annotation[],
  box: Rectangle<'Image'>
): Annotation[] => {
  const result = []
  for (const annotation of annotations) {
    if (!annotation.isImageAnnotation()) {
      const data = editor.activeView.annotationManager.inferVideoAnnotationDataOnly(
        annotation.data,
        'bounding_box'
      )

      const { text } = editor.activeView.annotationManager.inferVideoSubAnnotationDataOnly(
        annotation.data
      )

      if (!text || !data) { continue }

      const centroid: Point<'Image'> = data.topLeft.add(data.bottomRight).div(2)
      if (centroid.x > box.left && centroid.x < box.right &&
          centroid.y > box.top && centroid.y < box.bottom) {
        result.push(annotation)
      }
      continue
    }

    const subAnnotations = annotation.subAnnotations
    const textSub = subAnnotations.find((subAnnotation) => 'text' in subAnnotation)
    if (!textSub) { continue }

    const { centroid } = annotation
    if (!centroid) { continue }

    if (centroid.x > box.left && centroid.x < box.right &&
        centroid.y > box.top && centroid.y < box.bottom) {
      result.push(annotation)
    }
  }
  return result
}

export const createStringData = (context: ToolContext, tool: FieldTool): AnnotationData | null => {
  const { mainAnnotations } = context.editor.activeView.annotationManager
  const { initialPoint: p1, cursorPoint: p2 } = tool
  if (!p1 || !p2) { return null }

  const imageP1 = context.editor.activeView.camera.canvasViewToImageView(p1)
  const imageP2 = context.editor.activeView.camera.canvasViewToImageView(p2)
  const box = new Rectangle(imageP1, imageP2)
  if (!box.isValid()) { return null }

  const sources = annotationsWithinBox(
    context.editor,
    mainAnnotations.reverse(),
    box
  ).map(annotation => (
    { id: annotation.id, ranges: null }
  ))

  return { sources }
}

export const createGraphData = (keyId: string, valueId: string): AnnotationData | null => {
  return {
    nodes: [
      { id: keyId, name: 'key' },
      { id: valueId, name: 'value' }
    ],
    edges: [
      { start: 'key', end: 'value' }
    ]
  }
}

export const tool: FieldTool = {
  initialPoint: undefined,
  cursorPoint: undefined,
  keyStringData: undefined,
  selectedAnnotations: [],
  saving: false,

  onStart (context: ToolContext, event: CanvasEvent) {
    if (this.saving) { return CallbackStatus.Stop }

    const point = resolveEventPoint(event)
    if (!point) { return }

    this.initialPoint = point
    if (FeatureFlagsManager.isOnLayerV2) {
      this.draw(context.editor.activeView)
    } else {
      context.editor.activeView.annotationsLayer.changed()
    }
  },

  onMove (context: ToolContext, event: CanvasEvent) {
    if (this.saving) { return CallbackStatus.Stop }

    const point = resolveEventPoint(event)
    if (!point) { return }

    this.cursorPoint = point
    const cursorText = this.keyStringData
      ? 'Highlight Field Value'
      : 'Highlight Field Key'
    context.editor.selectCursor(EditorCursor.BBox, cursorText, this.cursorPoint)

    if (FeatureFlagsManager.isOnLayerV2) {
      this.draw(context.editor.activeView)
    } else {
      context.editor.activeView.annotationsLayer.changed()
    }
    if (!this.initialPoint) { return }

    const imageP1 = context.editor.activeView.camera.canvasViewToImageView(this.initialPoint)
    const imageP2 = context.editor.activeView.camera.canvasViewToImageView(this.cursorPoint)
    const box = new Rectangle(imageP1, imageP2)
    if (!box.isValid()) { return CallbackStatus.Stop }

    this.selectedAnnotations = annotationsWithinBox(
      context.editor,
      context.editor.activeView.annotationManager.mainAnnotations,
      box
    )

    return CallbackStatus.Stop
  },

  async onEnd (context: ToolContext, event: CanvasEvent) {
    if (this.saving) { return CallbackStatus.Stop }

    const point = resolveEventPoint(event, true)
    if (point !== null) {
      this.cursorPoint = point
    }

    if (!this.initialPoint || !this.cursorPoint) { return }

    const stringData = createStringData(context, this)
    if (!stringData) {
      this.initialPoint = undefined
      this.cursorPoint = undefined
      if (FeatureFlagsManager.isOnLayerV2) {
        this.draw(context.editor.activeView)
      } else {
        context.editor.activeView.annotationsLayer.changed()
      }
      return
    }

    if (!this.keyStringData) {
      this.keyStringData = stringData
      this.initialPoint = undefined
      this.cursorPoint = undefined
      if (FeatureFlagsManager.isOnLayerV2) {
        this.draw(context.editor.activeView)
      } else {
        context.editor.activeView.annotationsLayer.changed()
      }
      return
    }

    const annotationClasses = context.editor.store.state.aclass.classes
    const keyClass = annotationClasses.find(ac => ac.name === 'key')!
    const valueClass = annotationClasses.find(ac => ac.name === 'value')!

    const keyParams: StringParams = {
      id: uuidv4(),
      classId: keyClass.id,
      type: STRING_ANNOTATION_TYPE,
      data: this.keyStringData
    }

    const valueParams: StringParams = {
      id: uuidv4(),
      classId: valueClass.id,
      type: STRING_ANNOTATION_TYPE,
      data: stringData
    }

    const graphData = createGraphData(keyParams.id, valueParams.id)
    if (!graphData) {
      this.initialPoint = undefined
      this.cursorPoint = undefined
      if (FeatureFlagsManager.isOnLayerV2) {
        this.draw(context.editor.activeView)
      } else {
        context.editor.activeView.annotationsLayer.changed()
      }
      return CallbackStatus.Stop
    }

    const keyvalueClassId = context.editor.store.state.workview.preselectedAnnotationClassId!

    const keyvalueParams: { classId: number, type: AnnotationTypeName, data: AnnotationData } =
      { classId: keyvalueClassId, type: GRAPH_ANNOTATION_TYPE, data: graphData }

    const allParams = []
    if (keyParams.data.sources.length > 0) {
      allParams.push(keyParams)
    }
    if (valueParams.data.sources.length > 0) {
      allParams.push(valueParams)
    }
    allParams.push(keyvalueParams)

    try {
      this.saving = true
      await context.editor.activeView.annotationManager.createAnnotations(allParams)
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

  async activate (context: ToolContext) {
    setupWheelPanning(context)
    setupTouchPanning(context)
    setupWASDPanning(context)
    setupZoom(context)

    // ask to preselect an annotation class if it's not preselected when activating the tool
    const preselectedAnnotationClassIds = context
      .editor
      .store
      .state
      .workview
      .preselectedAnnotationClassIds

    const hasPreselectedAnnotationClass =
      'skeleton_tool' in preselectedAnnotationClassIds &&
      preselectedAnnotationClassIds.skeleton_tool

    if (!hasPreselectedAnnotationClass) {
      const annotationClass =
        await context.editor.activeView.annotationManager.resolveAnnotationClass('graph')

      if (!annotationClass) {
        const content =
          'You must create or select an exising Skeleton class before using the skeleton tool'
        context.editor.store.dispatch('toast/notify', { content })
        context.editor.toolManager.activateTool('edit_tool')
        return
      }
      context.editor.store.commit('workview/PRESELECT_CLASS_ID', annotationClass.id)
    }

    context.editor.selectCursor(EditorCursor.BBox, 'Highlight Field Key', this.cursorPoint)

    context.editor.registerCommand('field_tool.cancel', () => {
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

          const graphColor =
            parseRGBA(context.editor.activeView.annotationManager.preselectedAnnotationClassColor())

          for (const annotation of this.selectedAnnotations) {
            const path = getBoundingBoxPath(annotation, view)

            drawPath(
              { path, additionalPaths: [] },
              ctx,
              view.camera,
              graphColor,
              false,
              context.editor.activeView.imageFilter
            )
          }

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
  deactivate () {
  },
  draw (view: View): void {
    view.annotationsLayer.draw(ctx => {
      const graphColor = parseRGBA(view.annotationManager.preselectedAnnotationClassColor())

      for (const annotation of this.selectedAnnotations) {
        const path = getBoundingBoxPath(annotation, view)

        drawPathV2(
          fn => view.annotationsLayer.draw(fn),
          { path, additionalPaths: [] },
          view.camera,
          graphColor,
          false,
          view.imageFilter
        )
      }

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
  reset (context: ToolContext) {
    this.initialPoint = undefined
    this.cursorPoint = undefined
    this.selectedAnnotations = []
    this.keyStringData = undefined
    this.saving = false

    if (context.editor.activeView.measureManager.showMeasures) {
      context.editor.activeView.measureManager.removeOverlayForDrawingAnnotation()
    }
  }
}
