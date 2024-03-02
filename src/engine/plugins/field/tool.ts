import { v4 as uuidv4 } from 'uuid'

import { EditorCursor } from '@/engine/EditorCursor'
import { Editor } from '@/engine/editor'
import { drawPath } from '@/engine/graphics'
import { Tool, ToolContext } from '@/engine/managers'
import { Annotation, AnnotationData } from '@/engine/models'
import { getPath as getBoundingBoxPath } from '@/engine/plugins/boundingBox/BoundingBoxRenderer'
import {
  setupTouchPanning,
  setupWASDPanning,
  setupWheelPanning,
  setupZoom
} from '@/engine/plugins/mixins'
import { CallbackStatus } from '@/engineCommon/callbackHandler'
import { CanvasPoint, Point } from '@/engineCommon/point'
import { Rectangle } from '@/engineCommon/rectangle'
import { AnnotationTypeName } from '@/store/types'
import { parseRGBA } from '@/utils'
import { isLeftMouseButton } from '@/utils/mouse'
import { CanvasEvent, resolveEventPoint } from '@/utils/touch'

import { GRAPH_ANNOTATION_TYPE, STRING_ANNOTATION_TYPE } from './types'

interface FieldTool extends Tool {
  initialPoint?: CanvasPoint
  cursorPoint?: CanvasPoint
  keyStringData?: AnnotationData
  selectedAnnotations: Annotation[]
  saving: Boolean

  onStart: (context: ToolContext, event: CanvasEvent) => void
  onMove: (context: ToolContext, event: CanvasEvent) => void
  onEnd: (context: ToolContext, event: CanvasEvent) => void
}

const annotationsWithinBox = (
  editor: Editor,
  annotations: Annotation[],
  box: Rectangle<'Image'>
): Annotation[] => {
  const result = []
  for (const annotation of annotations) {
    if (!annotation.isImageAnnotation()) {
      const data = editor.inferVideoAnnotationDataOnly(annotation.data, 'bounding_box')
      const { text } = editor.inferVideoSubAnnotationDataOnly(annotation.data)

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
  const { mainAnnotations } = context.editor
  const { initialPoint: p1, cursorPoint: p2 } = tool
  if (!p1 || !p2) { return null }

  const imageP1 = context.editor.camera.canvasViewToImageView(p1)
  const imageP2 = context.editor.camera.canvasViewToImageView(p2)
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
    context.editor.activeView.annotationsLayer.changed()
  },

  onMove (context: ToolContext, event: CanvasEvent) {
    if (event.target !== context.editor.activeView.annotationsLayer.canvas) {
      return CallbackStatus.Stop
    }

    if (this.saving) { return CallbackStatus.Stop }

    const point = resolveEventPoint(event)
    if (!point) { return }

    this.cursorPoint = point
    const cursorText = this.keyStringData
      ? 'Highlight Field Value'
      : 'Highlight Field Key'
    context.editor.selectCursor(EditorCursor.BBox, cursorText, this.cursorPoint)

    context.editor.activeView.annotationsLayer.changed()
    if (!this.initialPoint) { return }

    const imageP1 = context.editor.camera.canvasViewToImageView(this.initialPoint)
    const imageP2 = context.editor.camera.canvasViewToImageView(this.cursorPoint)
    const box = new Rectangle(imageP1, imageP2)
    if (!box.isValid()) { return CallbackStatus.Stop }

    this.selectedAnnotations = annotationsWithinBox(
      context.editor,
      context.editor.mainAnnotations,
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
      context.editor.activeView.annotationsLayer.changed()
      return
    }

    if (!this.keyStringData) {
      this.keyStringData = stringData
      this.initialPoint = undefined
      this.cursorPoint = undefined
      context.editor.activeView.annotationsLayer.changed()
      return
    }

    const annotationClasses = context.editor.store.state.aclass.classes
    const keyClass = annotationClasses.find(ac => ac.name === 'key')!
    const valueClass = annotationClasses.find(ac => ac.name === 'value')!

    type Params = { id: string, classId: number, type: AnnotationTypeName, data: AnnotationData }

    const keyParams: Params =
      { id: uuidv4(), classId: keyClass.id, type: STRING_ANNOTATION_TYPE, data: this.keyStringData }

    const valueParams: Params =
      { id: uuidv4(), classId: valueClass.id, type: STRING_ANNOTATION_TYPE, data: stringData }

    const graphData = createGraphData(keyParams.id, valueParams.id)
    if (!graphData) {
      this.initialPoint = undefined
      this.cursorPoint = undefined
      context.editor.activeView.annotationsLayer.changed()
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
      await context.editor.activeView.createAnnotations(allParams)
    } finally {
      this.reset(context)

      if (context.editor.showMeasures) {
        context.editor.activeView.measureManager.removeOverlayForDrawingAnnotation()
      }
    }
    context.editor.activeView.annotationsLayer.changed()
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
      const annotationClass = await context.editor.activeView.resolveAnnotationClass('graph')
      if (!annotationClass) {
        const content =
          'You must create or select an exising Skeleton class before using the skeleton tool'
        context.editor.store.dispatch( 'toast/notify', { content })
        context.editor.activateTool('edit_tool')
        return
      }
      context.editor.store.commit('workview/PRESELECT_CLASS_ID', annotationClass.id)
    }

    context.editor.selectCursor(EditorCursor.BBox, 'Highlight Field Key', this.cursorPoint)

    context.editor.registerCommand('field_tool.cancel', () => {
      this.reset(context)
      context.editor.activeView.annotationsLayer.changed()
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

    const viewsOnRender = context.editor.viewsList.map(view =>
      view.renderManager.onRender((view) => {
        const ctx = view.annotationsLayer.context
        if (!ctx) { return }

        const graphColor = parseRGBA(context.editor.preselectedAnnotationClassColor())

        for (const annotation of this.selectedAnnotations) {
          const path = getBoundingBoxPath(annotation, view)

          drawPath(
            context.editor.activeView,
            { path, additionalPaths: [] },
            graphColor,
            false,
            context.editor.activeView.imageFilter
          )
        }

        if (this.cursorPoint) {
          ctx.beginPath()
          ctx.lineWidth = 0.5
          ctx.strokeStyle = 'rgb(227, 234, 242)' // Alice Shade
          ctx.moveTo(this.cursorPoint.x, 0)
          ctx.lineTo(this.cursorPoint.x, view.annotationsLayer.canvas.height)
          ctx.moveTo(0, this.cursorPoint.y)
          ctx.lineTo(view.annotationsLayer.canvas.width, this.cursorPoint.y)
          ctx.stroke()
        }

        if (this.cursorPoint == null || this.initialPoint == null) { return }

        ctx.beginPath()
        ctx.strokeStyle = context.editor.preselectedAnnotationClassColor()
        ctx.fillStyle = context.editor.preselectedAnnotationClassColor(0.15)
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
  },
  deactivate () {
  },
  reset (context: ToolContext) {
    this.initialPoint = undefined
    this.cursorPoint = undefined
    this.selectedAnnotations = []
    this.keyStringData = undefined
    this.saving = false

    if (context.editor.showMeasures) {
      context.editor.activeView.measureManager.removeOverlayForDrawingAnnotation()
    }
  }
}
