import { EventEmitter } from 'events'

import { event as gaEvent } from 'vue-analytics'

import { euclideanDistance } from './algebra/euclideanDistance'
import { Point, ImagePoint, CanvasPoint } from './point'

export const MAX_SCALE = 50
export const CANVAS_CONTENT_VISIBILITY_MARGIN = 20
export const CURSOR_FIRST_VERTEX_MAX_DISTANCE = 8

enum Events {
  SCALE_CHANGED = 'scale:changed',
  OFFSET_CHANGED = 'offset:changed',
  SET_WIDTH = 'width:changed',
  SET_HEIGHT = 'height:changed',
  SET_IMAGE = 'image:set'
}

/**
 * @event scale:changed
 * @event offset:changed
 * @event width:changed
 * @event height:changed
 * @event image:set
 */
export class Camera extends EventEmitter {
  static SCALE_CHANGED = Events.SCALE_CHANGED
  static OFFSET_CHANGED = Events.OFFSET_CHANGED
  static SET_WIDTH = Events.SET_WIDTH
  static SET_HEIGHT = Events.SET_HEIGHT
  static SET_IMAGE = Events.SET_IMAGE

  public width: number = 1;
  public height: number = 1;
  public image: { width: number, height: number } = { width: 1, height: 1 }
  public lineWidth: number = 1

  private _offset: Point<any> = new Point({ x: 0, y: 0 })

  public get offset (): Point<any> {
    return this._offset
  }

  public set offset (value: Point<any>) {
    this._offset = value
    this.emit(Events.OFFSET_CHANGED, this._offset)
  }

  private _scale: number = 1.0;

  public get scale (): number {
    return this._scale
  }

  public set scale (value: number) {
    this._scale = value
    this.emit(Events.SCALE_CHANGED, this._scale)
  }

  public setWidth (width: number): void {
    this.width = width
    this.emit(Events.SET_WIDTH, this.width)
  }

  public setHeight (height: number): void {
    this.height = height
    this.emit(Events.SET_HEIGHT, this.height)
  }

  public getOffset (): Point<any> {
    return this._offset
  }

  public getMinZoom (): number {
    const hRatio = this.height / this.image.height
    const wRatio = this.width / this.image.width
    return Math.min(hRatio, wRatio) / 2
  }

  public setImage (image: { width: number, height: number }, resetZoom: boolean = true): void {
    this.image = image
    this.emit(Events.SET_IMAGE, this.image)
    if (resetZoom) {
      this.scaleToFit()
    }
  }

  public get scaleToFitValue (): number {
    const hRatio = this.height / this.image.height
    const wRatio = this.width / this.image.width
    return Math.min(hRatio, wRatio)
  }

  public scaleToFit (): void {
    this.scale = this.scaleToFitValue

    const xBorder = this.width - this.image.width * this.scale
    this.offset = new Point({ x: -xBorder / 2, y: 0 })
  }

  public setOffset (point: CanvasPoint): void {
    this.offset = point
  }

  public canvasViewToImageView (point: CanvasPoint): ImagePoint {
    return new Point<'Image'>({
      x: (point.x + this.offset.x) / this.scale,
      y: (point.y + this.offset.y) / this.scale
    })
  }

  public imageViewToCanvasView (point: ImagePoint): CanvasPoint {
    return new Point<'Canvas'>({
      x: point.x * this.scale - this.offset.x,
      y: point.y * this.scale - this.offset.y
    })
  }

  // Translate and scales the CanvasRenderingContext so that a Path2D in Image coordinates
  // gets drawn correctly in Canvas coordinates
  public imageViewCtxToCanvasViewCtx (ctx: CanvasRenderingContext2D): void {
    ctx.scale(this.scale, this.scale)
    ctx.translate(-this.offset.x / this.scale, -this.offset.y / this.scale)
  }

  public cursorIsClosingPath (cursorPoint: CanvasPoint, initialPoint: ImagePoint): boolean {
    return euclideanDistance(
      this.canvasViewToImageView(cursorPoint),
      initialPoint
    ) < CURSOR_FIRST_VERTEX_MAX_DISTANCE / this.scale
  }

  public drawImageParams (image: { width: number, height: number }): number[] {
    return [-this.offset.x, -this.offset.y, image.width * this.scale, image.height * this.scale]
  }

  public zoomToBox (p1: CanvasPoint, p2: CanvasPoint): void {
    const srcInitialPoint = p1.add(this.offset).mul(1.0 / this.scale)
    const srcEndPoint = p2.add(this.offset).mul(1.0 / this.scale)

    const w = this.width
    const h = this.height
    const nw = Math.abs(srcEndPoint.x - srcInitialPoint.x)
    const nh = Math.abs(srcEndPoint.y - srcInitialPoint.y)
    this.scale = (w / h < nw / nh) ? Math.min(w / nw, MAX_SCALE) : Math.min(h / nh, MAX_SCALE)

    const nRectStart = (
      new Point<'Canvas'>({
        x: Math.min(srcInitialPoint.x, srcEndPoint.x),
        y: Math.min(srcInitialPoint.y, srcEndPoint.y)
      })
    ).mul(this.scale)
    const nRectEnd = (
      new Point<'Canvas'>({
        x: Math.max(srcInitialPoint.x, srcEndPoint.x),
        y: Math.max(srcInitialPoint.y, srcEndPoint.y)
      })
    ).mul(this.scale)
    const viewportEnd = nRectStart.add(new Point<'Canvas'>({ x: w, y: h }))

    this.setOffset(nRectStart.sub(viewportEnd.sub(nRectEnd).mul(0.5)))
  }

  zoom (magnificationFactor: number, offset: CanvasPoint): void {
    magnificationFactor > 1
      ? this.zoomIn(offset, magnificationFactor)
      : this.zoomOut(offset, 1 / magnificationFactor)
  }

  zoomIn (offset: CanvasPoint, magnificationFactor = 1.25): void {
    gaEvent('workview', 'zoom_in')
    // this is the mouse cursors position in the unscaled image
    const srcPosition = offset.add(this.offset).mul(1.0 / this.scale)
    this.scale = (this.scale * magnificationFactor > MAX_SCALE)
      ? MAX_SCALE
      : this.scale * magnificationFactor
    // then we zoom and move the camera to keep the viewport unchanged
    this.setOffset(srcPosition.mul(this.scale - 1).add(srcPosition.sub(offset)))
  }

  zoomOut (offset: CanvasPoint, magnificationFactor = 1.25): void {
    gaEvent('workview', 'zoom_out')
    const srcPosition = offset.add(this.offset).mul(1.0 / this.scale)
    this.scale = (this.scale / magnificationFactor < this.getMinZoom())
      ? this.getMinZoom()
      : this.scale / magnificationFactor
    this.setOffset(srcPosition.mul(this.scale - 1).add(srcPosition.sub(offset)))
  }

  scroll (
    delta: CanvasPoint,
    scalingFactor = 2
  ): void {
    delta = delta.div(scalingFactor)
    this._offset.add_(delta)

    const { height, width } = this.image

    const maxHorizontalOffset = width * this.scale - CANVAS_CONTENT_VISIBILITY_MARGIN
    const minHorizontalOffset = -this.width + CANVAS_CONTENT_VISIBILITY_MARGIN
    const maxVerticalOffset = height * this.scale - CANVAS_CONTENT_VISIBILITY_MARGIN
    const minVerticalOffset = -this.height + CANVAS_CONTENT_VISIBILITY_MARGIN
    if (this._offset.x > maxHorizontalOffset) {
      this._offset.x = maxHorizontalOffset
    } else if (this._offset.x < minHorizontalOffset) {
      this._offset.x = minHorizontalOffset
    }
    if (this._offset.y > maxVerticalOffset) {
      this._offset.y = maxVerticalOffset
    } else if (this._offset.y < minVerticalOffset) {
      this._offset.y = minVerticalOffset
    }

    this.emit(Events.OFFSET_CHANGED, this._offset)
  }
}
