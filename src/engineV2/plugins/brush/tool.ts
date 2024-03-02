import {
  Segment,
  combine,
  polygon,
  segments,
  selectDifference,
  selectUnion
} from 'polybooljs'

import colors from '@/assets/styles/darwin/variables/colors.module.scss'
import { maybeSimplifyPolygon } from '@/engineCommon/algebra'
import { CallbackStatus } from '@/engineCommon/callbackHandler'
import { EditablePoint, ImagePoint, IPoint, Point } from '@/engineCommon/point'
import { EditorCursor } from '@/engineV2/EditorCursor'
import { drawBrush, drawBrushV2 } from '@/engineV2/graphics'
import { ActionGroup, Tool, ToolContext, ToolManager } from '@/engineV2/managers'
import { FeatureFlagsManager } from '@/engineV2/managers/featureFlagsManager'
import { Annotation, CompoundPath } from '@/engineV2/models'
import {
  setupTouchPanning,
  setupWASDPanning,
  setupWheelPanning,
  setupZoom
} from '@/engineV2/plugins/mixins'
import { POLYGON_ANNOTATION_TYPE } from '@/engineV2/plugins/polygon/types'
import { View } from '@/engineV2/views'
import { hexToRGBA, parseRGBA, rgbaString } from '@/utils'
import { isLeftMouseButton } from '@/utils/mouse'
import { CanvasEvent, isTouchEvent, resolveEventPoint } from '@/utils/touch'

import {
  buildBrushTip,
  buildRegularPolygonPath,
  buildSquarePath,
  fromPolyBool,
  getSides,
  interpolate,
  interpolateSquare,
  toPolyBool,
  translatePath
} from './utils'

const MAX_BRUSH_SIZE = 1000
const BRUSH_SCALING_FACTOR = 1.618

export class BrushTool implements Tool {
  /**
   * The polygon path descibing the tip of the polygon.
   * It is instantiated as a dodecagon, and rebuilt every time the tip size changes
   */
  tipPath: number[][] = buildRegularPolygonPath(5, 12)

  /**
   * Whole path being created. Since it can be drawn with multiple brush strokes,
   * it is computed by merging all currentPath instances
   */
  compoundPath: Segment | null = null

  /**
   * Path of the polygon currently being drawn
   */
  currentPath: Segment = { segments: [], inverted: false }

  /**
   * Whole path previously created. Used for undoing/redoing.
   */
  previousCompoundPath: Segment | null = null

  /**
   * Path of the polygon previously drawn. Used for undoing/redoing.
   */
  previousCurrentPath: Segment = { segments: [], inverted: false }

  /**
   * Size of the brush, corresponding to the radius of the tip
   */
  size: number = 10

  /**
   * Last known position of the mouse (on image)
   *
   * Constantly updates as mouse moves.
   */
  mousePoint: ImagePoint | undefined = undefined

  drawing: boolean = false

  /**
   * The previous position of the mouse, used to interpolate between onmousemove calls
   */
  previousMousePoint: ImagePoint | undefined = undefined

  /**
   * Currently selected annotation.
   * If it is defined, the brush will draw on top of it.
   * Otherwise, the brush will draw a new path.
   */
  selectedAnnotation: Annotation | undefined = undefined

  actionGroup: ActionGroup | undefined = undefined

  touching: boolean = false
  squareRadius: number = this.size

  /**
   * Brush mode:
   * - brush: merge drawn polygons together in a single compound path
   * - eraser: subtract drawn polygon from the existing compound path
   */
  mode (toolManager: ToolManager): string {
    const { currentTool: tool } = toolManager
    if (!tool || tool.name !== 'brush_tool') { return 'brush' }

    const activeToolOption = (tool.toolConfig.toolOptions || [])
      .filter(option => option.category === 'brush-mode')
      .find(option => option.active)

    if (!activeToolOption) { return 'brush' }

    return activeToolOption.id
  }

  /**
   * Brush tip shape:
   * - squared
   * - round
   */
  tipShape (context: ToolContext): string {
    const { currentTool: tool } = context.editor.toolManager
    if (!tool || tool.name !== 'brush_tool') { return 'round' }

    const activeToolOption = (tool.toolConfig.toolOptions || [])
      .filter(option => option.category === 'brush-tip-shape')
      .find(option => option.active)

    if (!activeToolOption || !activeToolOption.id) { return 'round' }

    return activeToolOption.id
  }

  async savePolygon (context: ToolContext): Promise<void> {
    if (!this.compoundPath) { return }

    const epsilon = (document as any).darwin_epsilon || 0.5
    const originalData = fromPolyBool(polygon(this.compoundPath))

    const data: CompoundPath = {
      path: maybeSimplifyPolygon(originalData.path, epsilon)
        .map(point => new EditablePoint<'Image'>(point)),
      additionalPaths: originalData.additionalPaths.map(
        path => maybeSimplifyPolygon(path, epsilon).map(point => new EditablePoint<'Image'>(point))
      )
    }

    // First, check that data is valid
    // This is especially useful when erasing a polygon entirely
    const paths = [data.path, ...data.additionalPaths]
    for (const path of paths) {
      if (path.length < 3) { return }
      const index = path.findIndex((p) => p.isSelected)
      if (index >= 0) { return }
    }
    // Otherwise, either update the annotation if the brush is editing the selected annotation
    // or create a new one. Note that the newly created annotation needs to be deselected,
    // otherwise it will still look as a temporary brush drawing
    const params = { type: POLYGON_ANNOTATION_TYPE, data }
    if (this.selectedAnnotation) {
      let updatedAnnotation
      if (this.selectedAnnotation.isVideoAnnotation()) {
        const { activeView } = context.editor
        if (!activeView.fileManager.isProcessedAsVideo) {
          throw new Error('Brush: Expected video/DICOM to be loaded')
        }

        const { subs } = this.selectedAnnotation.inferVideoData(activeView)
        updatedAnnotation = this.selectedAnnotation.shallowClone({
          data: {
            ...this.selectedAnnotation.data,
            frames: {
              ...this.selectedAnnotation.data.frames,
              [activeView.currentFrameIndex]: data
            }
          }
        })
        if (updatedAnnotation.isVideoAnnotation()) {
          updatedAnnotation.subAnnotations.frames[activeView.currentFrameIndex] = subs
        }
      } else {
        updatedAnnotation = this.selectedAnnotation.shallowClone({ data })
      }
      const previousAnnotation = this.selectedAnnotation
      // selectedAnnotation needs to be undefined or tool.shouldRender() will block the annotation
      // which leads to issues with overlayManager and sub annotation pills
      this.selectedAnnotation = undefined
      const action = {
        annotation: updatedAnnotation,
        previousAnnotation,
        do (): boolean {
          context.editor.activeView.annotationManager.updateAnnotation(this.annotation)
          return true
        },
        undo (): boolean {
          context.editor.activeView.annotationManager.updateAnnotation(this.previousAnnotation)
          return true
        }
      }
      this.actionGroup = this.actionGroup || context.editor.actionManager.createGroup()
      this.actionGroup.do(action)
    } else {
      let annotation
      try {
        annotation = await context.editor
          .activeView
          .annotationManager
          .createAnnotationAction(params)
      } catch (e: unknown) {
        console.error(e)
      }
      if (!annotation) { return }
    }
    context.editor.activeView.annotationManager.deselectAllAnnotations()

    if (this.actionGroup) {
      this.actionGroup.remove()
      this.actionGroup = undefined
    }
    if (FeatureFlagsManager.isOnLayerV2) {
      this.draw(context.editor.activeView)
    } else {
      context.editor.activeView.annotationsLayer.changed()
    }
    this.reset()
  }

  buildPolygon (context: ToolContext): void {
    const mode = this.mode(context.editor.toolManager)
    if (this.compoundPath === null && mode === 'brush') {
      this.compoundPath = { ...this.currentPath }
      this.currentPath = { segments: [], inverted: false }
      return
    }
    // if this.compoundPath is null now, it means we are in erase mode and it's the first stroke,
    // so we should reset this.currentPath
    if (this.compoundPath === null) {
      this.currentPath = { segments: [], inverted: false }
      return
    }

    // For brush tool squared tip it something failing with error
    try {
      const combined = combine(this.compoundPath, this.currentPath)

      this.compoundPath = this.mode(context.editor.toolManager) === 'brush'
        ? selectUnion(combined)
        : selectDifference(combined)
      this.currentPath = { segments: [], inverted: false }
    } catch (e: unknown) {
      console.error(e)

      this.compoundPath = { ...this.currentPath }
      this.currentPath = { segments: [], inverted: false }
    }
  }

  rebuildTipPath (context: ToolContext): void {
    this.tipPath = this.tipShape(context) === 'round'
      ? buildRegularPolygonPath(this.size / 2, getSides(this.tipShape(context), this.size / 2))
      : buildSquarePath(this.size / 2 + 1)
  }

  recomputeSquareBrushRadius (): void {
    this.squareRadius = this.size / 2 / Math.SQRT2
  }

  activate (context: ToolContext): void {
    setupWheelPanning(context)
    setupTouchPanning(context)
    setupWASDPanning(context)
    setupZoom(context)

    context.editor.selectCursor(EditorCursor.Hidden)

    context.editor.toolManager.setToolOptionProps('brush-size', {
      value: Math.round(this.size),
      commandName: 'brush_tool.set_brush_size'
    })

    context.editor.registerCommand('brush_tool.activate_brush', () => {
      context.editor.toolManager.setToolOptionProps('brush-size', {
        value: Math.round(this.size),
        commandName: 'brush_tool.set_brush_size'
      })
      context.editor.toolManager.activateToolOption('brush')
    })

    context.editor.registerCommand('brush_tool.activate_eraser', () => {
      context.editor.toolManager.setToolOptionProps('brush-size', {
        value: Math.round(this.size),
        commandName: 'brush_tool.set_brush_size'
      })
      this.recomputeSquareBrushRadius()
      context.editor.toolManager.activateToolOption('eraser')
    })

    context.editor.registerCommand('brush_tool.activate_round_tip', () => {
      context.editor.toolManager.activateToolOption('round')
      this.rebuildTipPath(context)
    })

    context.editor.registerCommand('brush_tool.activate_squared_tip', () => {
      context.editor.toolManager.activateToolOption('squared')
      this.rebuildTipPath(context)
    })

    context.editor.registerCommand('brush_tool.save', () => {
      this.confirmCurrentAnnotation(context)
      if (FeatureFlagsManager.isOnLayerV2) {
        this.draw(context.editor.activeView)
      } else {
        context.editor.activeView.annotationsLayer.changed()
      }
    })

    context.editor.registerCommand('brush_tool.cancel', () => {
      context.editor.activeView.annotationManager.deselectAllAnnotations()
      this.reset()
      if (FeatureFlagsManager.isOnLayerV2) {
        this.draw(context.editor.activeView)
      } else {
        context.editor.activeView.annotationsLayer.changed()
      }
    })

    context.editor.registerCommand('brush_tool.grow', () => {
      const size = this.size * BRUSH_SCALING_FACTOR
      this.size = size <= MAX_BRUSH_SIZE ? size : MAX_BRUSH_SIZE
      this.recomputeSquareBrushRadius()

      this.rebuildTipPath(context)

      context.editor.toolManager.setToolOptionProps('brush-size', {
        value: Math.round(this.size),
        commandName: 'brush_tool.set_brush_size'
      })
      if (FeatureFlagsManager.isOnLayerV2) {
        this.draw(context.editor.activeView)
      } else {
        context.editor.activeView.annotationsLayer.changed()
      }
    })

    context.editor.registerCommand('brush_tool.shrink', () => {
      this.size = this.size > BRUSH_SCALING_FACTOR ? this.size / BRUSH_SCALING_FACTOR : 1
      this.recomputeSquareBrushRadius()

      this.rebuildTipPath(context)

      context.editor.toolManager.setToolOptionProps('brush-size', {
        value: Math.round(this.size),
        commandName: 'brush_tool.set_brush_size'
      })
      if (FeatureFlagsManager.isOnLayerV2) {
        this.draw(context.editor.activeView)
      } else {
        context.editor.activeView.annotationsLayer.changed()
      }
    })

    context.editor.registerCommand('brush_tool.set_brush_size', (size: number) => {
      this.size = size
      this.recomputeSquareBrushRadius()

      this.rebuildTipPath(context)

      context.editor.toolManager.setToolOptionProps('brush-size', {
        value: Math.round(this.size),
        commandName: 'brush_tool.set_brush_size'
      })
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

    context.handles.push(...context.editor.onMouseMove(e => this.onMove(context, e)))
    context.handles.push(...context.editor.onMouseUp(e => this.onEnd(context, e)))

    context.handles.push(...context.editor.onTouchStart(e => this.onStart(context, e)))
    context.handles.push(...context.editor.onTouchMove(e => this.onMove(context, e)))
    context.handles.push(...context.editor.onTouchEnd(e => this.onEnd(context, e)))

    context.handles.push(...context.editor.onKeyDown(e => this.onKeyDown(context, e)))
    context.handles.push(...context.editor.onKeyUp(e => this.onKeyUp(context, e)))

    if (FeatureFlagsManager.isOffLayerV2) {
      const viewsOnRender = context.editor.viewsList.map(view =>
        view.renderManager.onRender((view) => this.onRender(view, context))
      )

      context.handles.push(...viewsOnRender)
    }
  }

  maybeSuppressMouseEvent (event: CanvasEvent): void | CallbackStatus {
    event.preventDefault()
    const touching = isTouchEvent(event)
    if (!touching && this.touching) {
      // A touch event was already triggered, so we should prevent this mouse event to trigger
      return CallbackStatus.Stop
    } else {
      this.touching = touching
    }
  }

  onStart (context: ToolContext, event: CanvasEvent): CallbackStatus | void {
    this.maybeSuppressMouseEvent(event)

    if (isTouchEvent(event) && event.targetTouches.length > 2) {
      this.savePolygon(context)
      if (FeatureFlagsManager.isOnLayerV2) {
        this.draw(context.editor.activeView)
      } else {
        context.editor.activeView.annotationsLayer.changed()
      }
      this.reset()
      return
    }

    const canvasPoint = resolveEventPoint(event)
    if (!canvasPoint) { return }

    const imagePoint = context.editor.activeView.camera.canvasViewToImageView(canvasPoint)

    // Save previous path state
    this.previousCompoundPath = this.compoundPath ? { ...this.compoundPath } : null
    this.previousCurrentPath = { ...this.currentPath }
    this.drawing = true
    this.mousePoint = undefined
    this.previousMousePoint = undefined
    this.currentPath = segments(buildBrushTip(imagePoint, this.tipPath))
    this.buildPolygon(context)
    if (FeatureFlagsManager.isOnLayerV2) {
      this.draw(context.editor.activeView)
    }

    return CallbackStatus.Stop
  }

  onMove (context: ToolContext, event: CanvasEvent): CallbackStatus | void {
    if (!context.editor.activeView.hitTarget(event)) {
      return CallbackStatus.Stop
    }

    this.maybeSuppressMouseEvent(event)

    const canvasPoint = resolveEventPoint(event)
    if (!canvasPoint) { return }

    const imagePoint = context.editor.activeView.camera.canvasViewToImageView(canvasPoint)

    this.previousMousePoint = this.drawing && this.mousePoint
      ? new Point<'Image'>({ x: this.mousePoint.x, y: this.mousePoint.y })
      : undefined
    this.mousePoint = imagePoint

    if (!this.drawing) {
      if (FeatureFlagsManager.isOnLayerV2) {
        this.draw(context.editor.activeView)
      } else {
        context.editor.activeView.annotationsLayer.changed()
      }
      return
    }

    if (this.previousMousePoint) {
      const interpolated = this.tipShape(context) === 'round'
        ? interpolate(this.previousMousePoint, this.mousePoint, this.size / 2)
        : interpolateSquare(this.previousMousePoint, this.mousePoint, this.squareRadius)

      // If PolyBool detects that epsilon is too small or too large,
      // it will throw an error. So need to catch and ignore current path update.
      try {
        const combined = combine(this.currentPath, interpolated)
        this.currentPath = selectUnion(combined)
      } catch (e: unknown) {
        console.error(e)
        return
      }
    }

    const currentTip = segments(buildBrushTip(imagePoint, this.tipPath))
    // If PolyBool detects that epsilon is too small or too large,
    // it will throw an error. So need to catch and ignore current path update.
    try {
      const combined = combine(this.currentPath, currentTip)
      this.currentPath = selectUnion(combined)
    } catch (e: unknown) {
      console.error(e)
      return
    }
    this.buildPolygon(context)

    this.previousMousePoint = imagePoint

    context.editor.activeView.unhighlightAllVertices()
    if (FeatureFlagsManager.isOnLayerV2) {
      this.draw(context.editor.activeView)
    } else {
      context.editor.activeView.annotationsLayer.changed()
    }
  }

  onEnd (context: ToolContext, event: CanvasEvent): CallbackStatus {
    this.maybeSuppressMouseEvent(event)

    this.actionGroup = this.actionGroup || context.editor.actionManager.createGroup()
    const brush = this
    const action = {
      // Keep original compoundPath and currentPath to restore it later
      previousCompoundPath: brush.previousCompoundPath ? { ...brush.previousCompoundPath } : null,
      previousCurrentPath: brush.previousCurrentPath,
      compoundPath: brush.compoundPath ? { ...brush.compoundPath } : null,
      currentPath: { ...brush.currentPath },
      do (): boolean {
        brush.compoundPath = this.compoundPath ? { ...this.compoundPath } : null
        brush.currentPath = { ...this.currentPath }
        if (FeatureFlagsManager.isOnLayerV2) {
          brush.draw(context.editor.activeView)
        } else {
          context.editor.activeView.annotationsLayer.changed()
        }
        return true
      },
      undo (): boolean {
        brush.compoundPath = this.previousCompoundPath ? { ...this.previousCompoundPath } : null
        brush.currentPath = { ...this.previousCurrentPath }
        if (FeatureFlagsManager.isOnLayerV2) {
          brush.draw(context.editor.activeView)
        } else {
          context.editor.activeView.annotationsLayer.changed()
        }
        return true
      }
    }
    this.actionGroup.do(action)

    this.drawing = false

    if (FeatureFlagsManager.isOnLayerV2) {
      this.draw(context.editor.activeView)
    } else {
      context.editor.activeView.annotationsLayer.changed()
    }
    return CallbackStatus.Stop
  }

  onKeyDown (context: ToolContext, event: KeyboardEvent): void {
    const shift = 16
    if (event.keyCode !== shift) { return }

    this.buildPolygon(context)
    context.editor.toolManager.activateToolOption('eraser')
  }

  onKeyUp (context: ToolContext, event: KeyboardEvent): void {
    const shift = 16
    if (event.keyCode !== shift) { return }

    this.buildPolygon(context)
    context.editor.toolManager.activateToolOption('brush')
  }

  private resolveCompundPath (view: View, selectedAnnotation: Annotation): CompoundPath {
    let compoundPath: CompoundPath

    if (selectedAnnotation.isVideoAnnotation()) {
      const { data } = selectedAnnotation.inferVideoData(view)
      compoundPath = {
        path: data.path.map(({ x, y }: IPoint) => ({ x, y })),
        additionalPaths: data.additionalPaths && data.additionalPaths.length > 0
          ? data.additionalPaths.map(
            (path: IPoint[]) => path.map(({ x, y }: IPoint) => ({ x, y }))
          )
          : undefined
      }
    } else {
      if (!selectedAnnotation.isImageAnnotation()) {
        throw new Error('brush tool: Annotation inferred as neither image nor video')
      }
      const annotationData = selectedAnnotation.data
      compoundPath = {
        path: annotationData.path.map(({ x, y }: IPoint) => ({ x, y })),
        additionalPaths: annotationData.additionalPaths && annotationData.additionalPaths.length > 0
          ? annotationData.additionalPaths.map((path: IPoint[]) =>
            path.map(({ x, y }: IPoint) => ({ x, y })))
          : undefined
      }
    }

    return compoundPath
  }

  draw (view: View): void {
    if (!this.mousePoint) { return }

    if (!this.drawing && !this.selectedAnnotation) {
      // If the brush tool is not busy drawing already, see if there's a selected annotation
      // If so, then hide it and show it as current path
      const selectedAnnotation = view.annotationManager.selectedAnnotation
      if (selectedAnnotation && selectedAnnotation.type === 'polygon') {
        const compoundPath = this.resolveCompundPath(view, selectedAnnotation)

        if (selectedAnnotation.annotationClass) {
          view.store.commit(
            'workview/PRESELECT_CLASS_ID',
            selectedAnnotation.annotationClass.id
          )
        }
        this.compoundPath = segments(toPolyBool(compoundPath))
        this.selectedAnnotation = selectedAnnotation
      }
    }

    const path = this.compoundPath
    // Forcing combination of compound path and current path fixes a problem with the
    // rendering of compound paths with fully intersecting edges
      ? selectUnion(combine(this.compoundPath, this.currentPath))
      : this.currentPath

    const colorHash = parseRGBA(view.annotationManager.preselectedAnnotationClassColor())

    const filter = view ? view.imageFilter : null

    if (this.selectedAnnotation) {
      // First you need to deactivate all active annotations
      // to clear active layer render pool
      view.annotationsLayer.getItem(this.selectedAnnotation.id)?.deactivate()
    }

    view.annotationsLayer.draw((ctx, canvas) => {
      if (!this.mousePoint) { return }

      drawBrushV2(
        drawFn => drawFn?.(ctx, canvas),
        view.camera,
        polygon(path),
        colorHash,
        filter
      )

      // Draw cursor after the paths, so it looks on top of it
      ctx.beginPath()

      ctx.strokeStyle = this.mode(view.editor.toolManager) === 'eraser'
        ? 'rgb(227, 234, 242)' // Alice Shade
        : view.annotationManager.preselectedAnnotationClassColor()

      ctx.fillStyle = this.mode(view.editor.toolManager) === 'eraser'
        ? 'rgba(227, 234, 242, 0.15)' // Alice Shade
        : view.annotationManager.preselectedAnnotationClassColor(0.15)

      ctx.lineWidth = 1

      const tipPolygon = translatePath(this.mousePoint, this.tipPath)
      const offset = view.camera.getOffset()
      ctx.moveTo(
        tipPolygon[0][0] * view.camera.scale - offset.x,
        tipPolygon[0][1] * view.camera.scale - offset.y
      )
      for (const [x, y] of tipPolygon) {
        ctx.lineTo(x * view.camera.scale - offset.x, y * view.camera.scale - offset.y)
      }
      ctx.closePath()
      ctx.stroke()
    })
  }

  onRender (view: View, context: ToolContext): void {
    const ctx = view.annotationsLayer.context
    if (!ctx) { return }

    if (!this.mousePoint) { return }

    // This logic shouldn't be in the renderer
    if (!this.drawing && !this.selectedAnnotation) {
      // If the brush tool is not busy drawing already, see if there's a selected annotation
      // If so, then hide it and show it as current path
      const selectedAnnotation = view.annotationManager.selectedAnnotation
      if (selectedAnnotation && selectedAnnotation.type === 'polygon') {
        const compoundPath = this.resolveCompundPath(view, selectedAnnotation)

        if (selectedAnnotation.annotationClass) {
          context.editor.store.commit(
            'workview/PRESELECT_CLASS_ID',
            selectedAnnotation.annotationClass.id
          )
        }
        this.compoundPath = segments(toPolyBool(compoundPath))
        this.selectedAnnotation = selectedAnnotation
      }
    }

    const path = this.compoundPath
      // Forcing combination of compound path and current path fixes a problem with the
      // rendering of compound paths with fully intersecting edges
      ? selectUnion(combine(this.compoundPath, this.currentPath))
      : this.currentPath

    const colorHash = parseRGBA(
      context.editor.activeView.annotationManager.preselectedAnnotationClassColor()
    )

    const filter = context.editor ? context.editor.activeView.imageFilter : null

    drawBrush(
      view.camera,
      view.annotationsLayer.context,
      polygon(path),
      colorHash,
      filter
    )

    // Draw cursor after the paths, so it looks on top of it
    ctx.beginPath()

    const brushTipColor = rgbaString(hexToRGBA(colors.colorAliceShade))

    ctx.strokeStyle = this.mode(context.editor.toolManager) === 'eraser'
      ? brushTipColor
      : context.editor.activeView.annotationManager.preselectedAnnotationClassColor()

    ctx.fillStyle =
    this.mode(context.editor.toolManager) === 'eraser'
      ? rgbaString(parseRGBA(brushTipColor), 0.15)
      : context.editor.activeView.annotationManager.preselectedAnnotationClassColor(0.15)

    ctx.lineWidth = 1

    ctx.shadowColor = brushTipColor
    ctx.shadowBlur = 4
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0

    const tipPolygon = translatePath(this.mousePoint, this.tipPath)
    const offset = view.camera.getOffset()
    ctx.moveTo(
      tipPolygon[0][0] * view.camera.scale - offset.x,
      tipPolygon[0][1] * view.camera.scale - offset.y
    )
    for (const [x, y] of tipPolygon) {
      ctx.lineTo(x * view.camera.scale - offset.x, y * view.camera.scale - offset.y)
    }
    ctx.closePath()
    ctx.stroke()
    ctx.fill()
  }

  deactivate (context: ToolContext): void {
    this.savePolygon(context)
    if (FeatureFlagsManager.isOnLayerV2) {
      context.editor.activeView.annotationsLayer.draw()
    } else {
      context.editor.activeView.annotationsLayer.changed()
    }
    this.reset()
  }

  shouldRender (annotation: Annotation): boolean {
    if (!this.selectedAnnotation) { return true }
    return this.selectedAnnotation.id !== annotation.id
  }

  reset (): void {
    this.selectedAnnotation = undefined
    this.drawing = false
    this.previousMousePoint = undefined
    this.currentPath = { segments: [], inverted: false }
    this.compoundPath = null
    this.previousCompoundPath = null
    this.previousCurrentPath = { segments: [], inverted: false }
    this.touching = false
  }

  isDrawing (): boolean {
    const { compoundPath } = this

    if (compoundPath === null) { return false }
    return compoundPath.segments.length > 0
  }

  async confirmCurrentAnnotation (context: ToolContext): Promise<void> {
    await this.savePolygon(context)
    this.reset()
    if (FeatureFlagsManager.isOnLayerV2) {
      this.draw(context.editor.activeView)
    } else {
      context.editor.activeView.annotationsLayer.changed()
    }
  }
}

export const tool = new BrushTool()
