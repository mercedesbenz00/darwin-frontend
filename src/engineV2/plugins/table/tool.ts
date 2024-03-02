import { range } from 'lodash'
import { v4 as uuidv4 } from 'uuid'

import { CallbackStatus } from '@/engineCommon/callbackHandler'
import { CanvasPoint, ImagePoint, Point } from '@/engineCommon/point'
import { Rectangle } from '@/engineCommon/rectangle'
import { EditorCursor } from '@/engineV2/EditorCursor'
import { Editor } from '@/engineV2/editor'
import { drawGuideLines } from '@/engineV2/graphics/drawGuideLines'
import { Tool, ToolContext } from '@/engineV2/managers'
import { FeatureFlagsManager } from '@/engineV2/managers/featureFlagsManager'
import { Annotation, AnnotationData } from '@/engineV2/models/annotation'
import { STRING_ANNOTATION_TYPE } from '@/engineV2/plugins/field/types'
import {
  setupTouchPanning,
  setupWASDPanning,
  setupWheelPanning,
  setupZoom
} from '@/engineV2/plugins/mixins'
import { View } from '@/engineV2/views'
import { AnnotationTypeName } from '@/store/types'
import { isLeftMouseButton } from '@/utils/mouse'
import { CanvasEvent, resolveEventPoint } from '@/utils/touch'

import { TableCell, TABLE_ANNOTATION_TYPE } from './types'
import { isOnRowOrColumn } from './utils'

type StringData = AnnotationData | null

type CellData = {
  id: string
  row: number
  col: number
  boundingBox: {
    x: number
    y: number
    w: number
    h: number
  },
  stringData: StringData
}

export interface TableTool extends Tool {
  initialPoint?: CanvasPoint
  cursorPoint?: CanvasPoint

  rowOffsets: number[]
  colOffsets: number[]

  initialImagePoint?: ImagePoint
  cursorImagePoint?: ImagePoint

  saving: boolean

  rows: number
  cols: number
  editingTableParams: {
    type: 'column' | 'row',
    offset: number
  } | undefined

  onStart: (context: ToolContext, event: CanvasEvent) => void
  onMove: (context: ToolContext, event: CanvasEvent) => void
  onEnd: (context: ToolContext, event: CanvasEvent) => void
  draw: (view: View) => void

  confirmTable: (context: ToolContext) => void
}

const annotationsWithinBox = (
  annotations: Annotation[],
  box: Rectangle<'Image'>,
  editor: Editor
): Annotation[] => {
  const result = []
  for (const annotation of annotations) {
    if (!annotation.isImageAnnotation()) {
      const data = editor.activeView.annotationManager.inferVideoAnnotationDataOnly(
        annotation.data,
        'bounding_box'
      )
      const { text } =
        editor.activeView.annotationManager.inferVideoSubAnnotationDataOnly(annotation.data)

      if (!text || !data) { continue }

      const centroid: Point<'Image'> = data.topLeft.add(data.bottomRight).div(2)
      if (centroid.x > box.left && centroid.x < box.right &&
          centroid.y > box.top && centroid.y < box.bottom) {
        result.push(annotation)
      }
      continue
    }

    const { subAnnotations } = annotation
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

export const createStringData = (
  context: ToolContext,
  initialPoint: ImagePoint,
  finalPoint: ImagePoint
): StringData => {
  const { mainAnnotations } = context.editor.activeView.annotationManager
  const box = new Rectangle(initialPoint, finalPoint)
  if (!box.isValid()) { return null }

  const sources = annotationsWithinBox(
    mainAnnotations.reverse(),
    box,
    context.editor
  ).map(annotation => (
    { id: annotation.id, ranges: null }
  ))

  return { sources }
}

export const createTableData = (context: ToolContext, tool: TableTool): CellData[] | null => {
  const { mainAnnotations } = context.editor.activeView.annotationManager
  const {
    initialImagePoint: p1,
    cursorImagePoint: p2,
    rowOffsets,
    colOffsets
  } = tool

  if (!p1 || !p2) { return null }

  const box = new Rectangle(p1, p2)
  if (!box.isValid()) { return null }

  // Build a list of source annotations that are within the table box.
  // Source annotations need to be bounding boxes and have a centroid.
  const sources = []
  for (const annotation of mainAnnotations) {
    annotation.initializeCachedAttributes()

    const { centroid, type } = annotation
    if (!centroid || type !== 'bounding_box') { continue }

    if (centroid.x > box.left && centroid.x < box.right &&
        centroid.y > box.top && centroid.y < box.bottom) {
      sources.push(annotation)
    }
  }

  // Build a list of cell data, that will be later used to create the
  // string annotations to represent the cells.
  const cells = []
  const fullRowOffsets = [0, ...rowOffsets, 1]
  const fullColOffsets = [0, ...colOffsets, 1]
  for (let row = 0; row < fullRowOffsets.length - 1; row++) {
    const thisRowOffset = fullRowOffsets[row]
    const nextRowOffset = fullRowOffsets[row + 1]

    for (let col = 0; col < fullColOffsets.length - 1; col++) {
      const thisColOffset = fullColOffsets[col]
      const nextColOffset = fullColOffsets[col + 1]

      const cellTopLeft = p1.add(new Point({
        x: thisColOffset * box.width,
        y: thisRowOffset * box.height
      }))

      const cellBottomRight = p1.add(new Point({
        x: nextColOffset * box.width,
        y: nextRowOffset * box.height
      }))

      const cell = {
        id: uuidv4(),
        row: row + 1,
        col: col + 1,
        boundingBox: {
          x: cellTopLeft.x,
          y: cellTopLeft.y,
          w: cellBottomRight.x - cellTopLeft.x,
          h: cellBottomRight.y - cellTopLeft.y
        },
        stringData: createStringData(
          context,
          p1.add(new Point({
            x: thisColOffset * box.width,
            y: thisRowOffset * box.height
          })),
          p1.add(new Point({
            x: nextColOffset * box.width,
            y: nextRowOffset * box.height
          }))
        )
      }
      cells.push(cell)
    }
  }
  return cells
}

export const tool: TableTool = {
  initialPoint: undefined,
  cursorPoint: undefined,
  saving: false,

  rows: 2,
  cols: 3,
  editingTableParams: undefined,

  rowOffsets: range(1, 2).map(o => o / 2),
  colOffsets: range(1, 3).map(o => o / 3),

  onStart (context: ToolContext, event: CanvasEvent) {
    if (this.saving) { return CallbackStatus.Stop }

    const point = resolveEventPoint(event)
    if (!point) { return }

    const onRowOrColumn = isOnRowOrColumn(point, this, context)
    if (onRowOrColumn) {
      this.editingTableParams = onRowOrColumn
      return CallbackStatus.Stop
    }

    this.initialPoint = point
    if (FeatureFlagsManager.isOnLayerV2) {
      this.draw(context.editor.activeView)
    } else {
      context.editor.activeView.annotationsLayer.changed()
    }
  },

  onMove (context: ToolContext, event: CanvasEvent) {
    context.editor.selectCursor(EditorCursor.BBox)

    if (this.saving) { return CallbackStatus.Stop }

    const point = resolveEventPoint(event)
    if (!point) { return }

    const { cursorImagePoint, editingTableParams, initialImagePoint } = this
    const imagePoint = context.editor.activeView.camera.canvasViewToImageView(point)
    if (editingTableParams && initialImagePoint && cursorImagePoint) {
      const { offset, type } = editingTableParams
      if (type === 'row') {
        const prevRowOffset = offset === 0 ? 0 : this.rowOffsets[offset - 1]

        const nextRowOffset = offset === this.rowOffsets.length - 1
          ? 1
          : this.rowOffsets[offset + 1]

        this.rowOffsets[offset] = Math.min(
          Math.max(
            ((imagePoint.y - initialImagePoint.y) / (cursorImagePoint.y - initialImagePoint.y)),
            prevRowOffset
          ),
          nextRowOffset
        )
      } else {
        const prevColOffset = offset === 0 ? 0 : this.colOffsets[offset - 1]

        const nextColOffset = offset === this.colOffsets.length - 1
          ? 1
          : this.colOffsets[offset + 1]

        this.colOffsets[offset] = Math.min(
          Math.max(
            ((imagePoint.x - initialImagePoint.x) / (cursorImagePoint.x - initialImagePoint.x)),
            prevColOffset
          ),
          nextColOffset
        )
      }
      if (FeatureFlagsManager.isOnLayerV2) {
        this.draw(context.editor.activeView)
      } else {
        context.editor.activeView.annotationsLayer.changed()
      }
      return CallbackStatus.Stop
    }

    if (isOnRowOrColumn(point, this, context)) {
      context.editor.selectCursor(EditorCursor.Pointer)
    }

    this.cursorPoint = point
    if (FeatureFlagsManager.isOnLayerV2) {
      this.draw(context.editor.activeView)
    } else {
      context.editor.activeView.annotationsLayer.changed()
    }
    if (!this.initialPoint) { return }

    return CallbackStatus.Stop
  },

  onEnd (context: ToolContext, event: CanvasEvent) {
    if (this.saving) { return CallbackStatus.Stop }

    if (this.editingTableParams) {
      this.editingTableParams = undefined
      return CallbackStatus.Stop
    }

    const point = resolveEventPoint(event, true)
    if (point !== null) {
      this.cursorPoint = point
    }

    if (!this.initialPoint || !this.cursorPoint) { return }

    this.initialImagePoint =
      context.editor.activeView.camera.canvasViewToImageView(this.initialPoint)
    this.cursorImagePoint = context.editor.activeView.camera.canvasViewToImageView(this.cursorPoint)

    const box = new Rectangle(this.initialImagePoint, this.cursorImagePoint)
    if (!box.isValid()) {
      this.reset(context)
      return
    }

    context.editor.store.dispatch('toast/notify', {
      content: `Pick desired number of rows and columns from the Top Bar
      and adjust cell boundaries. Press Enter to create the table.`,
    })
  },

  async confirmTable (context: ToolContext) {
    const cells = createTableData(context, this)
    if (!cells) {
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
    const cellClass = annotationClasses.find(ac => ac.name === 'cell')!

    const allParams: {
      id: string,
      classId?: number,
      type: AnnotationTypeName,
      data: AnnotationData
    }[] = []

    const tableCellData: TableCell[] = []

    for (const cell of cells) {
      if (!cell.stringData) { continue }

      const cellStringId = uuidv4()

      allParams.push({
        id: cellStringId,
        classId: cellClass.id,
        type: STRING_ANNOTATION_TYPE,
        data: cell.stringData
      })

      tableCellData.push({
        bounding_box: cell.boundingBox,
        id: cellStringId,
        row: cell.row,
        col: cell.col,
        row_span: 1,
        col_span: 1,
        is_header: false
      })
    }

    let boundingBox
    if (this.initialImagePoint && this.cursorImagePoint) {
      boundingBox = {
        x: this.initialImagePoint.x,
        y: this.initialImagePoint.y,
        w: this.cursorImagePoint.x - this.initialImagePoint.x,
        h: this.cursorImagePoint.y - this.initialImagePoint.y
      }
    }

    const tableParams: { id: string, type: AnnotationTypeName, data: AnnotationData } = {
      id: uuidv4(),
      type: TABLE_ANNOTATION_TYPE,
      data: {
        cells: tableCellData,
        rowOffsets: this.rowOffsets,
        colOffsets: this.colOffsets,
        boundingBox
      }
    }
    allParams.push(tableParams)

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

  activate (context: ToolContext) {
    setupWheelPanning(context)
    setupTouchPanning(context)
    setupWASDPanning(context)
    setupZoom(context)

    context.editor.selectCursor(EditorCursor.BBox)

    context.editor.toolManager.setToolOptionProps('rows', { value: this.rows })
    context.editor.toolManager.setToolOptionProps('cols', { value: this.cols })

    context.editor.registerCommand('table_tool.set_rows', (size: number) => {
      this.rows = size
      this.rowOffsets = range(1, this.rows).map(o => o / this.rows)

      context.editor.toolManager.setToolOptionProps('rows', { value: this.rows })
      if (FeatureFlagsManager.isOnLayerV2) {
        this.draw(context.editor.activeView)
      } else {
        context.editor.activeView.annotationsLayer.changed()
      }
    })

    context.editor.registerCommand('table_tool.set_cols', (size: number) => {
      this.cols = size
      this.colOffsets = range(1, this.cols).map(o => o / this.cols)

      context.editor.toolManager.setToolOptionProps('cols', { value: this.cols })
      if (FeatureFlagsManager.isOnLayerV2) {
        this.draw(context.editor.activeView)
      } else {
        context.editor.activeView.annotationsLayer.changed()
      }
    })

    context.editor.registerCommand('table_tool.cancel', () => {
      this.reset(context)
      if (FeatureFlagsManager.isOnLayerV2) {
        this.draw(context.editor.activeView)
      } else {
        context.editor.activeView.annotationsLayer.changed()
      }
    })

    context.editor.registerCommand('table_tool.confirm', async () => {
      await this.confirmTable(context)
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

    const viewsOnRender = context.editor.viewsList.map(view =>
      view.renderManager.onRender((view) => {
        const ctx = view.annotationsLayer.context
        if (!ctx) { return }

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

        const finalInitialPoint = this.initialImagePoint
          ? context.editor.activeView.camera.imageViewToCanvasView(this.initialImagePoint)
          : this.initialPoint

        const finalCursorPoint = this.cursorImagePoint
          ? context.editor.activeView.camera.imageViewToCanvasView(this.cursorImagePoint)
          : this.cursorPoint

        const x = finalInitialPoint.x
        const y = finalInitialPoint.y
        const w = finalCursorPoint.x - finalInitialPoint.x
        const h = finalCursorPoint.y - finalInitialPoint.y
        ctx.strokeRect(x, y, w, h)
        ctx.fillRect(x, y, w, h)

        for (const col of range(1, this.cols)) {
          const ratio = this.colOffsets[col - 1]
          ctx.beginPath()
          ctx.moveTo((x + ratio * w), y)
          ctx.lineTo((x + ratio * w), y + h)
          ctx.stroke()
        }
        for (const row of range(1, this.rows)) {
          const ratio = this.rowOffsets[row - 1]
          ctx.beginPath()
          ctx.moveTo(x, (y + ratio * h))
          ctx.lineTo(x + w, (y + ratio * h))
          ctx.stroke()
        }
      })
    )
    context.handles.push(...viewsOnRender)

    this.reset(context)
  },
  draw (view: View): void {
    view.annotationsLayer.draw(ctx => {
      if (this.cursorPoint) {
        drawGuideLines(ctx, view, this.cursorPoint)
      }

      if (this.cursorPoint == null || this.initialPoint == null) { return }

      ctx.beginPath()
      ctx.strokeStyle =
        view.annotationManager.preselectedAnnotationClassColor()
      ctx.fillStyle =
        view.annotationManager.preselectedAnnotationClassColor(0.15)
      ctx.lineWidth = 1

      const finalInitialPoint = this.initialImagePoint
        ? view.camera.imageViewToCanvasView(this.initialImagePoint)
        : this.initialPoint

      const finalCursorPoint = this.cursorImagePoint
        ? view.camera.imageViewToCanvasView(this.cursorImagePoint)
        : this.cursorPoint

      const x = finalInitialPoint.x
      const y = finalInitialPoint.y
      const w = finalCursorPoint.x - finalInitialPoint.x
      const h = finalCursorPoint.y - finalInitialPoint.y
      ctx.strokeRect(x, y, w, h)
      ctx.fillRect(x, y, w, h)

      for (const col of range(1, this.cols)) {
        const ratio = this.colOffsets[col - 1]
        ctx.beginPath()
        ctx.moveTo((x + ratio * w), y)
        ctx.lineTo((x + ratio * w), y + h)
        ctx.stroke()
      }
      for (const row of range(1, this.rows)) {
        const ratio = this.rowOffsets[row - 1]
        ctx.beginPath()
        ctx.moveTo(x, (y + ratio * h))
        ctx.lineTo(x + w, (y + ratio * h))
        ctx.stroke()
      }
    })
  },
  deactivate () {
  },
  reset (context: ToolContext) {
    this.initialPoint = undefined
    this.cursorPoint = undefined

    this.rowOffsets = range(1, this.rows).map(o => o / this.rows)
    this.colOffsets = range(1, this.cols).map(o => o / this.cols)

    this.initialImagePoint = undefined
    this.cursorImagePoint = undefined

    this.editingTableParams = undefined

    this.saving = false

    if (context.editor.activeView.measureManager.showMeasures) {
      context.editor.activeView.measureManager.removeOverlayForDrawingAnnotation()
    }

    context.editor.store.dispatch('toast/notify', { content: 'Click and drag to draw a table.' })
  }
}
