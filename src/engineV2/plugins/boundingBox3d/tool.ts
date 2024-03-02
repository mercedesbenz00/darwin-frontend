import { CallbackStatus } from '@/engineCommon/callbackHandler'
import { CanvasPoint, EditablePoint, Point } from '@/engineCommon/point'
import { Rectangle } from '@/engineCommon/rectangle'
import { EditorCursor } from '@/engineV2/EditorCursor'
import { drawSegment, drawSegmentV2 } from '@/engineV2/graphics'
import { drawGuideLines } from '@/engineV2/graphics/drawGuideLines'
import { Tool, ToolContext } from '@/engineV2/managers'
import { FeatureFlagsManager } from '@/engineV2/managers/featureFlagsManager'
import {
  setupWheelPanning,
  setupTouchPanning,
  setupWASDPanning,
  setupZoom
} from '@/engineV2/plugins/mixins'
import { View } from '@/engineV2/views'
import { parseRGBA, RGBA } from '@/utils'
import { isLeftMouseButton } from '@/utils/mouse'
import { CanvasEvent, resolveEventPoint } from '@/utils/touch'

import { annotationType } from './consts'
import { BoundingBox3D } from './types'

interface BoundingBox3DTool extends Tool {
  frontTopLeftPoint?: CanvasPoint,
  frontBottomRightPoint?: CanvasPoint,
  backTopLeftPoint?: CanvasPoint,
  cursorPoint?: CanvasPoint,
  context?: ToolContext,
  colorString: string,
  colorHash: RGBA,
  onStart(context: ToolContext, event: CanvasEvent): void,
  onMove(context: ToolContext, event: CanvasEvent): void,
  onEnd(context: ToolContext, event: CanvasEvent): void,
  draw(view: View): void
  /**
   * @depricated
   */
  render(view: View, context: ToolContext): void
}

export const tool: BoundingBox3DTool = {
  activate (context: ToolContext) {
    setupWheelPanning(context)
    setupTouchPanning(context)
    setupWASDPanning(context)
    setupZoom(context)

    context.editor.selectCursor(EditorCursor.BBox)

    context.editor.registerCommand('bounding_box_3d_tool.cancel', () => {
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
    context.handles.push(...context.editor.onMouseMove(event => this.onMove(context, event)))
    context.handles.push(...context.editor.onMouseUp(event => this.onEnd(context, event)))

    context.handles.push(...context.editor.onTouchStart(event => this.onStart(context, event)))
    context.handles.push(...context.editor.onTouchMove(event => this.onMove(context, event)))
    context.handles.push(...context.editor.onTouchEnd(event => this.onEnd(context, event)))
    if (FeatureFlagsManager.isOffLayerV2) {
      const viewsOnRender = context.editor.viewsList.map(view =>
        view.renderManager.onRender(view => this.render(view, context))
      )

      context.handles.push(...viewsOnRender)
    }

    this.context = context
  },

  draw (view: View) {
    view.annotationsLayer.draw((ctx, canvas, drawFn) => {
      if (!this.cursorPoint) { return }
      if (!drawFn) { return }

      drawGuideLines(ctx, view, this.cursorPoint)

      ctx.strokeStyle = this.colorString
      ctx.lineWidth = 1
      if (this.frontTopLeftPoint) {
        if (!this.frontBottomRightPoint) {
          ctx.strokeRect(
            this.frontTopLeftPoint.x,
            this.frontTopLeftPoint.y,
            this.cursorPoint.x - this.frontTopLeftPoint.x,
            this.cursorPoint.y - this.frontTopLeftPoint.y
          )
        } else {
          ctx.strokeRect(
            this.frontTopLeftPoint.x,
            this.frontTopLeftPoint.y,
            this.frontBottomRightPoint.x - this.frontTopLeftPoint.x,
            this.frontBottomRightPoint.y - this.frontTopLeftPoint.y
          )
          const frontTopLeft = this.frontTopLeftPoint
          const backTopLeft = this.cursorPoint
          const frontBottomRight = this.frontBottomRightPoint
          const frontWidth = frontBottomRight.sub(frontTopLeft).x
          const frontTopRight = new Point<'Image'>({
            x: frontTopLeft.x + frontWidth,
            y: frontTopLeft.y
          })
          const frontBottomLeft = new Point<'Image'>({
            x: frontBottomRight.x - frontWidth,
            y: frontBottomRight.y
          })
          if (!this.backTopLeftPoint) {
            drawSegmentV2(
              drawFn,
              view.camera,
              new EditablePoint(frontTopLeft),
              new EditablePoint(backTopLeft),
              this.colorHash,
              view.imageFilter
            )
            drawSegmentV2(
              drawFn,
              view.camera,
              new EditablePoint(frontTopRight),
              new EditablePoint(backTopLeft),
              this.colorHash,
              view.imageFilter
            )
            drawSegmentV2(
              drawFn,
              view.camera,
              new EditablePoint(frontBottomRight),
              new EditablePoint(backTopLeft),
              this.colorHash,
              view.imageFilter
            )
            drawSegmentV2(
              drawFn,
              view.camera,
              new EditablePoint(frontBottomLeft),
              new EditablePoint(backTopLeft),
              this.colorHash,
              view.imageFilter
            )
          }
        }
        if (this.backTopLeftPoint && this.frontBottomRightPoint) {
          ctx.strokeRect(
            this.backTopLeftPoint.x,
            this.backTopLeftPoint.y,
            this.cursorPoint.x - this.backTopLeftPoint.x,
            this.cursorPoint.y - this.backTopLeftPoint.y
          )

          const frontTopLeft = this.frontTopLeftPoint
          const frontBottomRight = this.frontBottomRightPoint
          const frontWidth = frontBottomRight.sub(frontTopLeft).x
          const frontTopRight = new Point<'Image'>({
            x: frontTopLeft.x + frontWidth,
            y: frontTopLeft.y
          })
          const frontBottomLeft = new Point<'Image'>({
            x: frontBottomRight.x - frontWidth,
            y: frontBottomRight.y
          })

          const backTopLeft = this.backTopLeftPoint
          const backBottomRight = this.cursorPoint
          const backWidth = backBottomRight.sub(backTopLeft).x
          const backTopRight = new Point<'Image'>({
            x: backTopLeft.x + backWidth,
            y: backTopLeft.y
          })
          const backBottomLeft = new Point<'Image'>({
            x: backBottomRight.x - backWidth,
            y: backBottomRight.y
          })

          drawSegmentV2(
            drawFn,
            view.camera,
            new EditablePoint(frontTopLeft),
            new EditablePoint(backTopLeft),
            this.colorHash,
            view.imageFilter
          )
          drawSegmentV2(
            drawFn,
            view.camera,
            new EditablePoint(frontBottomRight),
            new EditablePoint(backBottomRight),
            this.colorHash,
            view.imageFilter
          )
          drawSegmentV2(
            drawFn,
            view.camera,
            new EditablePoint(frontTopRight),
            new EditablePoint(backTopRight),
            this.colorHash,
            view.imageFilter
          )
          drawSegmentV2(
            drawFn,
            view.camera,
            new EditablePoint(frontBottomLeft),
            new EditablePoint(backBottomLeft),
            this.colorHash,
            view.imageFilter
          )
        }
      }
    })
  },

  /**
   * @depricated
   */
  render (view: View, context): void {
    const ctx = view.annotationsLayer.context
    if (!ctx) { return }
    if (!this.cursorPoint) { return }

    const camera = context.editor.activeView.camera

    drawGuideLines(ctx, view, this.cursorPoint)

    ctx.strokeStyle = this.colorString
    ctx.lineWidth = 1
    if (this.frontTopLeftPoint) {
      if (!this.frontBottomRightPoint) {
        ctx.strokeRect(
          this.frontTopLeftPoint.x,
          this.frontTopLeftPoint.y,
          this.cursorPoint.x - this.frontTopLeftPoint.x,
          this.cursorPoint.y - this.frontTopLeftPoint.y
        )
      } else {
        ctx.strokeRect(
          this.frontTopLeftPoint.x,
          this.frontTopLeftPoint.y,
          this.frontBottomRightPoint.x - this.frontTopLeftPoint.x,
          this.frontBottomRightPoint.y - this.frontTopLeftPoint.y
        )
        const frontTopLeft = camera.canvasViewToImageView(this.frontTopLeftPoint)
        const backTopLeft = camera.canvasViewToImageView(this.cursorPoint)
        const frontBottomRight = camera.canvasViewToImageView(this.frontBottomRightPoint)
        const frontWidth = frontBottomRight.sub(frontTopLeft).x
        const frontTopRight = new Point<'Image'>({
          x: frontTopLeft.x + frontWidth,
          y: frontTopLeft.y
        })
        const frontBottomLeft = new Point<'Image'>({
          x: frontBottomRight.x - frontWidth,
          y: frontBottomRight.y
        })
        if (!this.backTopLeftPoint) {
          drawSegment(
            view.camera,
            ctx,
            new EditablePoint(frontTopLeft),
            new EditablePoint(backTopLeft),
            this.colorHash,
            context.editor.activeView.imageFilter
          )
          drawSegment(
            view.camera,
            ctx,
            new EditablePoint(frontTopRight),
            new EditablePoint(backTopLeft),
            this.colorHash,
            context.editor.activeView.imageFilter
          )
          drawSegment(
            view.camera,
            ctx,
            new EditablePoint(frontBottomRight),
            new EditablePoint(backTopLeft),
            this.colorHash,
            context.editor.activeView.imageFilter
          )
          drawSegment(
            view.camera,
            ctx,
            new EditablePoint(frontBottomLeft),
            new EditablePoint(backTopLeft),
            this.colorHash,
            context.editor.activeView.imageFilter
          )
        }
      }
      if (this.backTopLeftPoint && this.frontBottomRightPoint) {
        ctx.strokeRect(
          this.backTopLeftPoint.x,
          this.backTopLeftPoint.y,
          this.cursorPoint.x - this.backTopLeftPoint.x,
          this.cursorPoint.y - this.backTopLeftPoint.y
        )

        const frontTopLeft = camera.canvasViewToImageView(this.frontTopLeftPoint)
        const frontBottomRight = camera.canvasViewToImageView(this.frontBottomRightPoint)
        const frontWidth = frontBottomRight.sub(frontTopLeft).x
        const frontTopRight = new Point<'Image'>({
          x: frontTopLeft.x + frontWidth,
          y: frontTopLeft.y
        })
        const frontBottomLeft = new Point<'Image'>({
          x: frontBottomRight.x - frontWidth,
          y: frontBottomRight.y
        })

        const backTopLeft = camera.canvasViewToImageView(this.backTopLeftPoint)
        const backBottomRight = camera.canvasViewToImageView(this.cursorPoint)
        const backWidth = backBottomRight.sub(backTopLeft).x
        const backTopRight = new Point<'Image'>({
          x: backTopLeft.x + backWidth,
          y: backTopLeft.y
        })
        const backBottomLeft = new Point<'Image'>({
          x: backBottomRight.x - backWidth,
          y: backBottomRight.y
        })

        drawSegment(
          view.camera,
          ctx,
          new EditablePoint(frontTopLeft),
          new EditablePoint(backTopLeft),
          this.colorHash,
          context.editor.activeView.imageFilter
        )
        drawSegment(
          view.camera,
          ctx,
          new EditablePoint(frontBottomRight),
          new EditablePoint(backBottomRight),
          this.colorHash,
          context.editor.activeView.imageFilter
        )
        drawSegment(
          view.camera,
          ctx,
          new EditablePoint(frontTopRight),
          new EditablePoint(backTopRight),
          this.colorHash,
          context.editor.activeView.imageFilter
        )
        drawSegment(
          view.camera,
          ctx,
          new EditablePoint(frontBottomLeft),
          new EditablePoint(backBottomLeft),
          this.colorHash,
          context.editor.activeView.imageFilter
        )
      }
    }
  },

  deactivate (context: ToolContext): void {
    if (FeatureFlagsManager.isOnLayerV2) {
      context.editor.activeView.annotationsLayer.draw()
    }
  },

  onStart (context: ToolContext, event: CanvasEvent) {
    const point = resolveEventPoint(event)
    if (!point) { return }

    if (!this.frontTopLeftPoint) {
      this.frontTopLeftPoint = point
    } else if (!this.backTopLeftPoint) {
      this.backTopLeftPoint = point
    }
    if (FeatureFlagsManager.isOnLayerV2) {
      this.draw(context.editor.activeView)
    } else {
      context.editor.activeView.annotationsLayer.changed()
    }
    return CallbackStatus.Stop
  },

  onMove (context: ToolContext, event: CanvasEvent) {
    if (!context.editor.activeView.hitTarget(event)) {
      return CallbackStatus.Stop
    }

    const point = resolveEventPoint(event)
    if (!point) { return }

    this.cursorPoint = point
    if (FeatureFlagsManager.isOnLayerV2) {
      this.draw(context.editor.activeView)
    } else {
      context.editor.activeView.annotationsLayer.changed()
    }
    return CallbackStatus.Stop
  },

  async onEnd (context: ToolContext, event: CanvasEvent) {
    const point = resolveEventPoint(event, true)
    if (point) {
      this.cursorPoint = point
    }

    if (!this.cursorPoint) { return }

    if (this.frontTopLeftPoint && !this.backTopLeftPoint) {
      const p1 = context.editor.activeView.camera.canvasViewToImageView(this.cursorPoint)
      const p2 = context.editor.activeView.camera.canvasViewToImageView(this.frontTopLeftPoint)
      const box = new Rectangle(p1, p2)
      if (!box.isValid()) {
        this.frontTopLeftPoint = undefined
        this.cursorPoint = undefined
        if (FeatureFlagsManager.isOnLayerV2) {
          this.draw(context.editor.activeView)
        } else {
          context.editor.activeView.annotationsLayer.changed()
        }
        return
      }
      this.frontBottomRightPoint = new Point(this.cursorPoint)
    } else if (this.frontTopLeftPoint && this.frontBottomRightPoint && this.backTopLeftPoint) {
      const p1 = context.editor.activeView.camera.canvasViewToImageView(this.cursorPoint)
      const p2 = context.editor.activeView.camera.canvasViewToImageView(this.backTopLeftPoint)
      const box = new Rectangle(p1, p2)
      if (!box.isValid()) {
        this.backTopLeftPoint = undefined
        this.cursorPoint = undefined
        if (FeatureFlagsManager.isOnLayerV2) {
          this.draw(context.editor.activeView)
        } else {
          context.editor.activeView.annotationsLayer.changed()
        }
        return
      }
      const frontTopLeft =
        context.editor.activeView.camera.canvasViewToImageView(this.frontTopLeftPoint)

      const frontBottomRight = context.editor.activeView.camera.canvasViewToImageView(
        this.frontBottomRightPoint
      )
      const backTopLeft =
        context.editor.activeView.camera.canvasViewToImageView(this.backTopLeftPoint)
      const backBottomRight =
        context.editor.activeView.camera.canvasViewToImageView(this.cursorPoint)

      const front = new Rectangle(frontTopLeft, frontBottomRight)
      const back = new Rectangle(backTopLeft, backBottomRight)
      const boundingBox3D: BoundingBox3D = {
        front: {
          topLeft: new EditablePoint(front.topLeft),
          topRight: new EditablePoint(front.topRight),
          bottomRight: new EditablePoint(front.bottomRight),
          bottomLeft: new EditablePoint(front.bottomLeft)
        },
        back: {
          topLeft: new EditablePoint(back.topLeft),
          topRight: new EditablePoint(back.topRight),
          bottomRight: new EditablePoint(back.bottomRight),
          bottomLeft: new EditablePoint(back.bottomLeft)
        }
      }
      const params = { type: annotationType, data: boundingBox3D }
      try {
        await context.editor
          .activeView
          .annotationManager
          .createAnnotationAction(params)
      } catch (e: unknown) {
        console.error(e)
      }
      this.frontTopLeftPoint = undefined
      this.frontBottomRightPoint = undefined
      this.backTopLeftPoint = undefined
      this.cursorPoint = undefined
      if (FeatureFlagsManager.isOnLayerV2) {
        this.draw(context.editor.activeView)
      } else {
        context.editor.activeView.annotationsLayer.changed()
      }
    }
    return CallbackStatus.Stop
  },

  reset () {
    this.frontTopLeftPoint = undefined
    this.backTopLeftPoint = undefined
    this.frontBottomRightPoint = undefined
    this.cursorPoint = undefined
  },

  get colorString () {
    const { context } = this
    if (!context) {
      return 'rgb(227, 234, 242)'
    }
    return context.editor.activeView.annotationManager.preselectedAnnotationClassColor()
  },

  get colorHash () {
    return parseRGBA(this.colorString)
  }
}
