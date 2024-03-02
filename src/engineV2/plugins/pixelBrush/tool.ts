import colors from '@/assets/styles/darwin/variables/colors.module.scss'
import { CallbackStatus } from '@/engineCommon/callbackHandler'
import { ImagePoint } from '@/engineCommon/point'
import { EditorCursor } from '@/engineV2/EditorCursor'
import { Tool, ToolContext, ToolManager } from '@/engineV2/managers'
import { FeatureFlagsManager } from '@/engineV2/managers/featureFlagsManager'
import { BrushPainter } from '@/engineV2/plugins/mask/utils/BrushPainter'
import {
  setupTouchPanning,
  setupWASDPanning,
  setupWheelPanning,
  setupZoom
} from '@/engineV2/plugins/mixins'
import { View } from '@/engineV2/views'
import {
  hexToRGBA,
  parseRGBA,
  rgbaString
} from '@/utils'
import { isLeftMouseButton } from '@/utils/mouse'
import { CanvasEvent, isTouchEvent, resolveEventPoint } from '@/utils/touch'

import {
  annotationType,
  TipShape
} from './consts'
import {
  buildRegularPolygonPath,
  buildSquarePath,
  getSides,
  translatePath
} from './utils'

const MAX_BRUSH_SIZE = 1000
const BRUSH_SCALING_FACTOR = 1.618

export class PixelBrushTool implements Tool {
  painter?: BrushPainter

  /**
   * The polygon path descibing the tip of the polygon.
   * It is instantiated as a dodecagon, and rebuilt every time the tip size changes
   */
  tipPath: number[][] = buildRegularPolygonPath(5, 12)

  /**
   * Size of the brush, corresponding to the radius of the tip
   */
  size: number = 10

  squareRadius: number = this.size
  touching: boolean = false

  /**
   * Last known position of the mouse (on image)
   *
   * Constantly updates as mouse moves.
   */
  mousePoint?: ImagePoint

  /**
   * Brush mode:
   * - brush: Draw pixels of the selected class onto the raster layer.
   * - eraser: Erase pixels of the selected class onto the raster layer.
   */
  mode (toolManager: ToolManager): string {
    const { currentTool: tool } = toolManager
    if (!tool || tool.name !== 'pixel_brush_tool') { return 'brush' }

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
  tipShape (context: ToolContext): TipShape {
    const { currentTool: tool } = context.editor.toolManager
    if (!tool || tool.name !== 'pixel_brush_tool') { return TipShape.Round }

    const activeToolOption = (tool.toolConfig.toolOptions || [])
      .filter(option => option.category === 'brush-tip-shape')
      .find(option => option.active)

    if (!activeToolOption || !activeToolOption.id) { return TipShape.Round }

    return <TipShape>activeToolOption.id
  }

  recomputeSquareBrushRadius (): void {
    this.squareRadius = this.size / 2 / Math.SQRT2
  }

  rebuildTipPath (context: ToolContext): void {
    this.tipPath = this.tipShape(context) === TipShape.Round
      ? buildRegularPolygonPath(this.size / 2, getSides(this.tipShape(context), this.size / 2))
      : buildSquarePath(this.size / 2 + 1)
  }

  async activate (context: ToolContext): Promise<void> {
    setupWheelPanning(context)
    setupTouchPanning(context)
    setupWASDPanning(context)
    setupZoom(context)

    // Ask to preselect an annotation class if it's not preselected when activating the tool
    const preselectedAnnotationClassIds = context
      .editor
      .store
      .state
      .workview
      .preselectedAnnotationClassIds
    const hasPreselectedAnnotationClass =
        'pixel_brush_tool' in preselectedAnnotationClassIds &&
        preselectedAnnotationClassIds.pixel_brush_tool

    if (!hasPreselectedAnnotationClass) {
      const errorMessage =
        'You must create or select an exising Mask class before using the Pixel Brush tool'

      const annotationClass =
          await context.editor.activeView.annotationManager.resolveAnnotationClass(annotationType)
      if (!annotationClass) {
        context.editor.store.dispatch(
          'toast/notify',
          {
            content: errorMessage
          }
        )
        context.editor.toolManager.activateToolWithStore('edit_tool')
        return
      }
      context.editor.store.commit('workview/PRESELECT_CLASS_ID', annotationClass.id)
    }

    context.editor.selectCursor(EditorCursor.Hidden)

    context.editor.toolManager.setToolOptionProps('brush-size', {
      value: Math.round(this.size),
      commandName: 'pixel_brush_tool.set_brush_size'
    })

    // Register tool commands

    context.editor.registerCommand('pixel_brush_tool.activate_brush', () => {
      context.editor.toolManager.setToolOptionProps('brush-size', {
        value: Math.round(this.size),
        commandName: 'pixel_brush_tool.set_brush_size'
      })
      context.editor.toolManager.activateToolOption('brush')
    })

    context.editor.registerCommand('pixel_brush_tool.activate_eraser', () => {
      context.editor.toolManager.setToolOptionProps('brush-size', {
        value: Math.round(this.size),
        commandName: 'pixel_brush_tool.set_brush_size'
      })
      context.editor.toolManager.activateToolOption('eraser')
    })

    context.editor.registerCommand('pixel_brush_tool.activate_round_tip', () => {
      context.editor.toolManager.activateToolOption(TipShape.Round)
      this.rebuildTipPath(context)
    })

    context.editor.registerCommand('pixel_brush_tool.activate_squared_tip', () => {
      context.editor.toolManager.activateToolOption(TipShape.Squared)
      this.rebuildTipPath(context)
    })

    context.editor.registerCommand('pixel_brush_tool.cancel', () => {
      context.editor.activeView.annotationManager.deselectAllAnnotations()
      console.warn('TODO => Cancel when we implement actions for the raster brush')
      if (FeatureFlagsManager.isOnLayerV2) {
        this.draw(context.editor.activeView)
      } else {
        context.editor.activeView.annotationsLayer.changed()
      }
      this.reset()
    })

    context.editor.registerCommand('pixel_brush_tool.grow', () => {
      const size = this.size * BRUSH_SCALING_FACTOR
      this.size = size <= MAX_BRUSH_SIZE ? size : MAX_BRUSH_SIZE
      this.recomputeSquareBrushRadius()

      this.rebuildTipPath(context)

      context.editor.toolManager.setToolOptionProps('brush-size', {
        value: Math.round(this.size),
        commandName: 'pixel_brush_tool.set_brush_size'
      })
      if (FeatureFlagsManager.isOnLayerV2) {
        this.draw(context.editor.activeView)
      } else {
        context.editor.activeView.annotationsLayer.changed()
      }
    })

    context.editor.registerCommand('pixel_brush_tool.shrink', () => {
      this.size = this.size > BRUSH_SCALING_FACTOR ? this.size / BRUSH_SCALING_FACTOR : 1
      this.recomputeSquareBrushRadius()

      this.rebuildTipPath(context)

      context.editor.toolManager.setToolOptionProps('brush-size', {
        value: Math.round(this.size),
        commandName: 'pixel_brush_tool.set_brush_size'
      })
      if (FeatureFlagsManager.isOnLayerV2) {
        this.draw(context.editor.activeView)
      } else {
        context.editor.activeView.annotationsLayer.changed()
      }
    })

    context.editor.registerCommand('pixel_brush_tool.set_brush_size', (size: number) => {
      this.size = size
      this.recomputeSquareBrushRadius()

      this.rebuildTipPath(context)

      context.editor.toolManager.setToolOptionProps('brush-size', {
        value: Math.round(this.size),
        commandName: 'pixel_brush_tool.set_brush_size'
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

    const viewsOnRender = context.editor.viewsList.map(view =>
      view.renderManager.onRender((view) => this.onRender(view, context))
    )

    if (FeatureFlagsManager.isOffLayerV2) {
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

  /**
   * Begin a brush stroke drawing to the raster layer.
   */
  onStart (context: ToolContext, event: CanvasEvent): CallbackStatus | void {
    this.maybeSuppressMouseEvent(event)

    const tipShape: TipShape = this.tipShape(context)

    if (isTouchEvent(event) && event.targetTouches.length > 2) {
      // TODO this.save(context)
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
    this.mousePoint = imagePoint

    const view = context.editor.activeView

    const { store: { state } } = context.editor.activeView
    const { preselectedAnnotationClassId } = state.workview

    if (!preselectedAnnotationClassId) {
      throw new Error('Preselected class not found, this should be selected on tool activation')
    }

    const isEraser = this.mode(context.editor.toolManager) === 'eraser'

    this.painter = new BrushPainter(view, preselectedAnnotationClassId, tipShape, isEraser)
    this.painter.stroke(imagePoint, this.size / 2)

    return CallbackStatus.Stop
  }

  /**
   * - If annotation started, paint brush strokes on move, as well as render brush tip.
   * - If not annotating, just update brush tip on mouse move.
   */
  onMove (context: ToolContext, event: CanvasEvent): CallbackStatus | void {
    if (!context.editor.activeView.hitTarget(event)) {
      return CallbackStatus.Stop
    }

    this.maybeSuppressMouseEvent(event)

    const canvasPoint = resolveEventPoint(event)
    if (!canvasPoint) { return }

    const imagePoint = context.editor.activeView.camera.canvasViewToImageView(canvasPoint)
    this.mousePoint = imagePoint

    if (!this.painter) {
      if (FeatureFlagsManager.isOnLayerV2) {
        this.draw(context.editor.activeView)
      } else {
        context.editor.activeView.annotationsLayer.changed()
      }

      return
    }

    this.painter.stroke(imagePoint, this.size / 2)

    if (FeatureFlagsManager.isOnLayerV2) {
      this.draw(context.editor.activeView)
    } else {
      context.editor.activeView.annotationsLayer.changed()
    }
  }

  /**
   * Finish the brush stroke and clean up the state.
   */
  onEnd (context: ToolContext, event: CanvasEvent): CallbackStatus {
    this.maybeSuppressMouseEvent(event)

    if (!this.painter) {
      throw new Error("Painter hasn't been initialized")
    }

    this.painter.endStroke()
    delete this.painter

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

    context.editor.toolManager.activateToolOption('eraser')
  }

  onKeyUp (context: ToolContext, event: KeyboardEvent): void {
    const shift = 16
    if (event.keyCode !== shift) { return }

    context.editor.toolManager.activateToolOption('brush')
  }

  onRender (view: View, context: ToolContext): void {
    console.warn(context)
    const ctx = view.annotationsLayer.context
    if (!ctx) { return }

    if (!this.mousePoint) { return }

    if (FeatureFlagsManager.isOnLayerV2) { return }

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

  draw (view: View): void {
    view.annotationsLayer.draw((ctx) => {
      if (!this.mousePoint) { return }

      const brushTipColor = rgbaString(hexToRGBA(colors.colorAliceShade))

      // Draw cursor after the paths, so it looks on top of it
      ctx.beginPath()

      ctx.strokeStyle = this.mode(view.editor.toolManager) === 'eraser'
        ? 'rgb(227, 234, 242)' // Alice Shade
        : view.annotationManager.preselectedAnnotationClassColor()

      ctx.fillStyle = this.mode(view.editor.toolManager) === 'eraser'
        ? 'rgba(227, 234, 242, 0.15)' // Alice Shade
        : view.annotationManager.preselectedAnnotationClassColor(0.15)

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
    })
  }

  deactivate (context: ToolContext): void {
    if (FeatureFlagsManager.isOnLayerV2) {
      context.editor.activeView.annotationsLayer.draw()
    } else {
      context.editor.activeView.annotationsLayer.changed()
    }
    this.reset()
  }

  reset (): void {
    if (this.painter) {
      this.painter.endStroke()
    }
    delete this.painter
    this.touching = false
  }
}

export const tool = new PixelBrushTool()
