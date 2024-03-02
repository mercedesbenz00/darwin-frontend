import EventEmitter from 'events'

import debounce from 'lodash/debounce'
import RBush from 'rbush'

import { CallbackHandle } from '@/engineCommon/callbackHandler'
import { Camera } from '@/engineCommon/camera'
import { ImagePoint, Point } from '@/engineCommon/point'
import { Object2D, RTreeObject2D } from '@/engineV2/models'

import { isVisible } from './helpers'
import { DrawFn, ILayer } from './types'

type Dimension = { width: number, height: number }

const CACHED_CANVAS_PADDING = 400
const DOUBLE_CACHED_CANVAS_PADDING = CACHED_CANVAS_PADDING * 2

/**
 * Accumulates items for render.
 *
 * Manages the rendering process of each item.
 * Optimizes rendering process by introducing active canvas,
 * cached canvas, and independent item rendering.
 */
export class OptimisedLayer extends EventEmitter implements ILayer {
  /**
   * Cached canvas keeps static (rendered) items
   * and re-use 'em to idle/pan/scale render.
   * Canvas not exists in the DOM.
   */
  private _cachedCanvas: HTMLCanvasElement | null
  private _cachedContext: CanvasRenderingContext2D | null

  /**
   * Cached canvas for HQ annotations render.
   * It uses camera width & height and sets scale
   * and offset provided by camera to render high quality annotations.
   * Canvas not exists in the DOM.
   */
  private _cachedCanvasHQ: HTMLCanvasElement | null
  private _cachedContextHQ: CanvasRenderingContext2D | null

  /**
   * Main canvas renders cached canvas or cached canvas HQ
   * respecting camera scale and offset.
   * Canvas exists in the DOM.
   */
  private _mainCanvas: HTMLCanvasElement | null
  private _mainContext: CanvasRenderingContext2D | null

  /**
   * Active canvas renders active items
   * or draws on canvas using public draw method.
   * Canvas exists in the DOM.
   */
  private _activeCanvas: HTMLCanvasElement | null
  private _activeContext: CanvasRenderingContext2D | null
  private _activeDrawCanvas: HTMLCanvasElement | null
  private _activeDrawContext: CanvasRenderingContext2D | null

  /**
   * List of activated items.
   *
   * Items will be rendered on active canvas and
   * ignored on cached canvas.
   */
  private _activeItems: Set<Object2D['id']> = new Set()

  private _hasChanges: boolean = false
  private _moving: boolean = false

  /**
   * Keeps all object 2d items.
   */
  private _renderPool: Map<string, Object2D> = new Map()
  /**
   * R-Tree of items to optimise items search by coordinates or bbox.
   */
  private _rTreeItems: RBush<RTreeObject2D> = new RBush(5)

  /**
   * Stores current offset value.
   * Prevents unnecessary rendering of the main canvas for the same offset value.
   */
  private offset = { x: 0, y: 0 }

  /**
   * Stores current scale value.
   * Prevents unnecessary rendering of the main canvas for the same scale value.
   */
  private scale = 0

  constructor (private camera: Camera) {
    super()
    this._cachedCanvas = document.createElement('canvas')
    this._cachedContext = this._cachedCanvas.getContext('2d')

    this._cachedCanvasHQ = document.createElement('canvas')
    this._cachedContextHQ = this._cachedCanvasHQ.getContext('2d')

    this._mainCanvas = document.createElement('canvas')
    this._mainContext = this._mainCanvas.getContext('2d')

    this._activeCanvas = document.createElement('canvas')
    this._activeContext = this._activeCanvas.getContext('2d')
    this._activeDrawCanvas = document.createElement('canvas')
    this._activeDrawContext = this._activeDrawCanvas.getContext('2d')

    camera.on(Camera.SCALE_CHANGED, this.onCanvasMove)
    camera.on(Camera.OFFSET_CHANGED, this.onCanvasMove)

    this.setSizeForCanvases()
    camera.on(Camera.SET_WIDTH, this.setSizeForCanvases)
    camera.on(Camera.SET_HEIGHT, this.setSizeForCanvases)

    this.setCachedCanvasSize(camera.image)
    camera.on(Camera.SET_IMAGE, this.setCachedCanvasSize)
  }

  private onCanvasMove = (): void => {
    this._moving = true
    this.resetMovingDebounce()

    if (this.camera.scale > this.camera.scaleToFitValue) {
      this.changedDebounce()
    }
  }

  /**
   * Set active, activeDrag, cached hq canvases dimension to camera size
   */
  private setSizeForCanvases = (): void => {
    this.activeCanvas.width = this.camera.width
    this.activeCanvas.height = this.camera.height
    this.activeDrawCanvas.width = this.camera.width
    this.activeDrawCanvas.height = this.camera.height
    this.cachedCanvasHQ.width = this.camera.width
    this.cachedCanvasHQ.height = this.camera.height
  }

  /**
   * Set cached canvas dimension to image size
   */
  private setCachedCanvasSize = ({ width, height }: Dimension): void => {
    this.cachedCanvas.width = width + DOUBLE_CACHED_CANVAS_PADDING
    this.cachedCanvas.height = height + DOUBLE_CACHED_CANVAS_PADDING
  }

  private get cachedContext (): CanvasRenderingContext2D {
    if (!this._cachedContext) { throw new Error('Something went wrong! Cached context not set!') }

    return this._cachedContext
  }

  private get cachedCanvas (): HTMLCanvasElement {
    if (!this._cachedCanvas) { throw new Error('Cached canvas does not exist!') }

    return this._cachedCanvas
  }

  private get cachedContextHQ (): CanvasRenderingContext2D {
    if (!this._cachedContextHQ) {
      throw new Error('Something went wrong! Cached context HQ not set!')
    }

    return this._cachedContextHQ
  }

  private get cachedCanvasHQ (): HTMLCanvasElement {
    if (!this._cachedCanvasHQ) { throw new Error('Cached canvas HQ does not exist!') }

    return this._cachedCanvasHQ
  }

  private get activeContext (): CanvasRenderingContext2D {
    if (!this._activeContext) { throw new Error('Something went wrong! Active context not set!') }

    return this._activeContext
  }

  private get activeCanvas (): HTMLCanvasElement {
    if (!this._activeCanvas) { throw new Error('Active canvas does not exist!') }

    return this._activeCanvas
  }

  private get activeDrawContext (): CanvasRenderingContext2D {
    if (!this._activeDrawContext) {
      throw new Error('Something went wrong! Active draw context not set!')
    }

    return this._activeDrawContext
  }

  private get activeDrawCanvas (): HTMLCanvasElement {
    if (!this._activeDrawCanvas) { throw new Error('Active draw canvas does not exist!') }

    return this._activeDrawCanvas
  }

  public get context (): CanvasRenderingContext2D {
    if (!this._mainContext) { throw new Error('Something went wrong! Context not set!') }

    return this._mainContext
  }

  public get canvas (): HTMLCanvasElement {
    if (!this._mainCanvas) { throw new Error('Canvas does not exist!') }

    return this._mainCanvas
  }

  /**
   * DOM attachable element getter which holds the canvas and the active canvas.
   * Use element as a single element to attach layers canvases to the DOM
   */
  public get element (): DocumentFragment {
    const frag = document.createDocumentFragment()

    frag.appendChild(this.canvas)

    this.activeCanvas.style.pointerEvents = 'none'
    frag.appendChild(this.activeCanvas)

    return frag
  }

  /**
   * Add new object(s) to the render pool.
   */
  add (payload: Object2D): void
  add (payload: Object2D[]): void
  add (payload: Object2D | Object2D[]): void {
    const items = Array.isArray(payload) ? payload : [payload]

    this.changed()

    const rTreeItems: RTreeObject2D[] = []

    items.forEach(item => {
      item.setLayer(this)
      this._renderPool.set(item.id, item)

      const bbox = item.getBBox?.()

      if (!bbox) { return }

      rTreeItems.push({
        minX: bbox.x - bbox.width / 2,
        minY: bbox.y - bbox.height / 2,
        maxX: bbox.x + bbox.width / 2,
        maxY: bbox.y + bbox.height / 2,
        item: item
      })
    })

    if (!rTreeItems.length) { return }
    this._rTreeItems.load(rTreeItems)
  }

  update (itemId: Object2D['id']): void {
    const item = this._renderPool.get(itemId)

    if (!item) { throw new Error('Item is not exists!') }

    const bbox = item.getBBox?.()

    if (!bbox) { return }

    const items = this._rTreeItems.all().filter(i => i.item.id !== itemId)
    this._rTreeItems.clear()
    this._rTreeItems.load(items)

    this._rTreeItems.insert({
      minX: bbox.x - bbox.width / 2,
      minY: bbox.y - bbox.height / 2,
      maxX: bbox.x + bbox.width / 2,
      maxY: bbox.y + bbox.height / 2,
      item
    })
  }

  /**
   * Delete object from the render pool by its id.
   */
  delete (itemId: Object2D['id']): void {
    const item = this.getItem(itemId)

    if (!item) { return }

    const items = this._rTreeItems.all().filter(i => i.item.id !== itemId)
    this._rTreeItems.clear()
    this._rTreeItems.load(items)

    item?.clear()
    this._renderPool.delete(itemId)
    this._deactivate(itemId)
  }

  /**
   * Returns object by its id.
   */
  getItem (id: string): Object2D | undefined {
    return this._renderPool.get(id)
  }

  /**
   * Returns all objects in the pool.
   */
  getAll (): { key: string, item: Object2D }[] {
    const res = []
    for (const key of this._renderPool.keys()) {
      const item = this.getItem(key)
      if (!item) { continue }

      res.push({
        key,
        item
      })
    }
    return res
  }

  /**
   * Checks if the object with id exists on the layer.
   */
  has (id: string): boolean {
    return !!this._renderPool.has(id)
  }

  private get isBeforeScaleToFit (): boolean {
    return this.camera.scale <= this.camera.scaleToFitValue
  }

  /**
   * Repaints item by its id with all intersected items.
   */
  private repaintCachedItem (id: Object2D['id']): void {
    const item = this.getItem(id)
    const bbox = item?.getBBox?.()

    if (!bbox) { return }

    const padding = 2.0 / this.camera.scale
    const a = new Point({
      x: (bbox.x - bbox.width / 2) - padding,
      y: (bbox.y - bbox.height / 2) - padding
    })
    const b = new Point({
      x: bbox.width + padding,
      y: bbox.height + padding
    })

    if (this.isBeforeScaleToFit) {
      // Clear item bbox section from the cached canvas
      this.cachedContext.clearRect(
        a.x + CACHED_CANVAS_PADDING,
        a.y + CACHED_CANVAS_PADDING,
        b.x,
        b.y
      )

      this.context.clearRect(
        0,
        0,
        this.camera.width,
        this.camera.height
      )
    } else {
      // Clear viewport section from the cached canvas
      this.cachedContext.clearRect(
        (this.lastHQOffset.x / this.lastHQScale) + CACHED_CANVAS_PADDING,
        (this.lastHQOffset.y / this.lastHQScale) + CACHED_CANVAS_PADDING,
        this.camera.width / this.lastHQScale,
        this.camera.height / this.lastHQScale
      )

      if (!this._moving) {
        this.context.clearRect(
          0,
          0,
          this.camera.width,
          this.camera.height
        )
      }
    }

    // Get all intersected items with the target item
    const items = this._rTreeItems.search({
      minX: a.x,
      minY: a.y,
      maxX: a.x + b.x,
      maxY: a.y + b.y
    })

    let x1 = 0
    let x2 = 0
    let y1 = 0
    let y2 = 0

    const canvas = document.createElement('canvas')
    if (this.isBeforeScaleToFit) {
      canvas.width = b.x
      canvas.height = b.y
    } else {
      x1 = (a.x * this.camera.scale) - (this.camera.offset.x)
      x2 = (this.camera.offset.x + this.camera.width) - ((a.x + b.x) * this.camera.scale)

      y1 = (a.y * this.camera.scale) - (this.camera.offset.y)
      y2 = (this.camera.offset.y + this.camera.height) - ((a.y + b.y) * this.camera.scale)

      let canvasWidth = b.x * this.camera.scale
      if (x1 < 0) { canvasWidth += x1 }
      if (x2 < 0) { canvasWidth += x2 }

      let canvasHeight = b.y * this.camera.scale
      if (y1 < 0) { canvasHeight += y1 }
      if (y2 < 0) { canvasHeight += y2 }

      canvas.width = canvasWidth
      canvas.height = canvasHeight
    }
    const ctx = canvas.getContext('2d')

    if (!ctx) { return }

    const drawCallback = (drawFn?: DrawFn): void => {
      drawFn?.(ctx, canvas, drawCallback)
    }

    for (const { item } of items) {
      if (this.isItemActive(item.id)) { continue }
      if (item.getBBox && !isVisible(this.camera, item.getBBox())) { continue }
      if (!ctx) { return }

      try {
        ctx.save()

        if (this.isBeforeScaleToFit) {
          ctx.translate(-a.x, -a.y)
        } else {
          ctx.scale(this.camera.scale, this.camera.scale)

          let x = -a.x
          let y = -a.y

          if (x1 < 0) { x -= b.x - (canvas.width / this.camera.scale) }
          if (x1 < 0 && x2 < 0) { x += Math.abs(x2) / this.camera.scale }

          if (y1 < 0) { y -= b.y - (canvas.height / this.camera.scale) }
          if (y1 < 0 && y2 < 0) { y += Math.abs(y2) / this.camera.scale }

          ctx.translate(
            x,
            y
          )
        }

        item.render(ctx, canvas, drawCallback)

        ctx.restore()
      } catch (e: unknown) {
        console.error(e)
      }
    }

    if (this.isBeforeScaleToFit) {
      this.cachedContext.drawImage(
        canvas,
        a.x + CACHED_CANVAS_PADDING,
        a.y + CACHED_CANVAS_PADDING,
        b.x,
        b.y
      )

      this.context.drawImage(
        this.cachedCanvas,
        -this.camera.offset.x - (CACHED_CANVAS_PADDING * this.camera.scale),
        -this.camera.offset.y - (CACHED_CANVAS_PADDING * this.camera.scale),
        this.cachedCanvas.width * this.camera.scale,
        this.cachedCanvas.height * this.camera.scale
      )
    } else {
      let x = -this.lastHQOffset.x + a.x * this.lastHQScale
      let y = -this.lastHQOffset.y + a.y * this.lastHQScale

      if (x1 < 0) { x += (b.x * this.lastHQScale) - canvas.width }
      if (x1 < 0 && x2 < 0) { x = 0 }

      if (y1 < 0) { y += (b.y * this.lastHQScale) - canvas.height }
      if (y1 < 0 && y2 < 0) { y = 0 }

      this.cachedContextHQ.clearRect(
        x,
        y,
        canvas.width,
        canvas.height
      )

      this.cachedContextHQ.drawImage(
        canvas,
        x,
        y,
        canvas.width,
        canvas.height
      )

      this.cachedContext.drawImage(
        this.cachedCanvasHQ,
        (this.lastHQOffset.x / this.lastHQScale) + CACHED_CANVAS_PADDING,
        (this.lastHQOffset.y / this.lastHQScale) + CACHED_CANVAS_PADDING,
        this.cachedCanvasHQ.width / this.lastHQScale,
        this.cachedCanvasHQ.height / this.lastHQScale
      )

      if (!this._moving) {
        this.context.drawImage(
          this.cachedCanvasHQ,
          0,
          0,
          this.camera.width,
          this.camera.height
        )
      }
    }
  }

  // Last HQ offset and scale prevent glitching on panning
  private lastHQOffset: Point<any> = new Point<any>({ x: 0, y: 0 })
  private lastHQScale: number = 0

  private drawCachedHQCallback = (drawFn?: DrawFn): void => {
    drawFn?.(this.cachedContextHQ, this.cachedCanvasHQ, this.drawCachedHQCallback)
  }

  /**
   * HQ items rendering by setting scale and offset to the canvases context.
   * Renders items from the render pool
   * ignores items outside the viewport
   * ignores activated items.
   */
  private renderCachedHQ (): void {
    if (
      this._hasChanges ||
      this.camera.scale !== this.scale ||
      this.camera.offset.x !== this.offset.x ||
      this.camera.offset.y !== this.offset.y
    ) {
      this.lastHQOffset.x = this.camera.offset.x
      this.lastHQOffset.y = this.camera.offset.y
      this.lastHQScale = this.camera.scale

      // Clear viewport section from the cached canvas
      this.cachedContext.clearRect(
        (this.camera.offset.x / this.camera.scale) + CACHED_CANVAS_PADDING,
        (this.camera.offset.y / this.camera.scale) + CACHED_CANVAS_PADDING,
        this.camera.width / this.camera.scale,
        this.camera.height / this.camera.scale
      )
      this.cachedContextHQ.clearRect(
        0,
        0,
        this.cachedCanvasHQ.width,
        this.cachedCanvasHQ.height
      )
      this.context.clearRect(
        0,
        0,
        this.camera.width,
        this.camera.height
      )

      // Renders all non-active items inside viewport
      for (const item of this._renderPool.values()) {
        if (this.isItemActive(item.id)) { continue }
        if (item.getBBox && !isVisible(this.camera, item.getBBox())) { continue }

        try {
          this.cachedContextHQ.save()
          // Set context scale to increase items quality
          this.cachedContextHQ.scale(this.camera.scale, this.camera.scale)
          // Set offset to respect x,y position of the items
          this.cachedContextHQ.translate(
            -this.offset.x / this.camera.scale,
            -this.offset.y / this.camera.scale
          )

          // Render item using HQ cached canvas/context
          item.render(this.cachedContextHQ, this.cachedCanvasHQ, this.drawCachedHQCallback)

          this.cachedContextHQ.restore()
        } catch (e: unknown) {
          console.error(e)
        }
      }

      // Insert HQ canvas into the cached canvas to keep fresh render.
      this.cachedContext.drawImage(
        this.cachedCanvasHQ,
        (this.camera.offset.x / this.camera.scale) + CACHED_CANVAS_PADDING,
        (this.camera.offset.y / this.camera.scale) + CACHED_CANVAS_PADDING,
        this.camera.width / this.camera.scale,
        this.camera.height / this.camera.scale
      )
      // Main canvas renders HQ cached canvas.
      // That provides higher quality for items.
      this.context.drawImage(
        this.cachedCanvasHQ,
        0,
        0,
        this.camera.width,
        this.camera.height
      )
    }
  }

  private drawCachedCallback = (drawFn?: DrawFn): void => {
    drawFn?.(this.cachedContext, this.cachedCanvas, this.drawCachedCallback)
  }

  /**
   * Renders all items from the render pool
   * ignores activated items.
   */
  private renderCached (): void {
    this.emit('before-render', this._mainContext, this._mainCanvas)

    this.cachedContext.clearRect(0, 0, this.cachedCanvas.width, this.cachedCanvas.height)

    // Renders all items on the cached canvas.
    for (const item of this._renderPool.values()) {
      if (this.isItemActive(item.id)) { continue }

      try {
        this.cachedContext.save()
        this.cachedContext.translate(
          CACHED_CANVAS_PADDING,
          CACHED_CANVAS_PADDING
        )

        // Render item using cached canvas/context
        item.render(
          this.cachedContext,
          this.cachedCanvas,
          this.drawCachedCallback
        )

        this.cachedContext.restore()
      } catch (e: unknown) {
        console.error(e)
      }
    }
  }

  /**
   * Renders cached canvas on DOM attached main canvas.
   */
  private renderMain (): void {
    const { scale, offset } = this.camera

    if (!this._hasChanges && !(
      scale !== this.scale ||
      offset.x !== this.offset.x ||
      offset.y !== this.offset.y
    )) { return }
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)

    // Saves current scale/offset to prevent useless redraw
    this.scale = scale
    this.offset.x = offset.x
    this.offset.y = offset.y

    // Draw cached canvas on the main canvas using current offset/scale.
    this.context.drawImage(
      this.cachedCanvas,
      -offset.x - (CACHED_CANVAS_PADDING * this.scale),
      -offset.y - (CACHED_CANVAS_PADDING * this.scale),
      this.cachedCanvas.width * this.camera.scale,
      this.cachedCanvas.height * this.camera.scale
    )

    this.emit('render', this.context, this.canvas)
  }

  private drawActiveCallback = (drawFn?: DrawFn): void => {
    drawFn?.(this.activeContext, this.activeCanvas, this.drawActiveCallback, true)
  }

  /**
   * Renders activated items on the active canvas.
   * Uses active canvas/context for rendering.
   */
  private renderActive (): void {
    this.activeContext.clearRect(0, 0, this.activeCanvas.width, this.activeCanvas.height)
    if (!this._activeItems.size) {
      this.activeContext.drawImage(
        this.activeDrawCanvas,
        0,
        0,
        this.activeDrawCanvas.width,
        this.activeDrawCanvas.height
      )
      return
    }

    this.activeContext.save()
    this.activeContext.scale(this.camera.scale, this.camera.scale)
    this.activeContext.translate(
      -this.camera.offset.x / this.camera.scale,
      -this.camera.offset.y / this.camera.scale
    )

    // Renders only active items.
    for (const itemId of this._activeItems.values()) {
      const item = this.getItem(itemId)

      if (!item) { continue }

      item.render(
        this.activeContext,
        this.activeCanvas,
        this.drawActiveCallback
      )
    }

    this.activeContext.restore()

    this.activeContext.drawImage(
      this.activeDrawCanvas,
      0,
      0,
      this.activeDrawCanvas.width,
      this.activeDrawCanvas.height
    )

    this.emit('render', this.context, this.canvas)
  }

  /**
   * Renders each item in the pool.
   *
   * If the layer has no changes it will skip re-render iteration.
   */
  render (): void {
    // TOOD: Render active if any item has changed == true
    this.renderActive()

    if (this._hasChanges) {
      if (this.isBeforeScaleToFit) {
        this.renderCached()
      }
    }

    this.renderMain()

    if (this._hasChanges) {
      if (this.camera.scale > this.camera.scaleToFitValue) {
        this.renderCachedHQ()
      }
    }

    this._hasChanges = false
  }

  private drawActiveDrawCallback = (drawFn?: DrawFn): void => {
    drawFn?.(this.activeDrawContext, this.activeDrawCanvas, this.drawActiveDrawCallback)
  }

  /**
   * Public interface that manages performant drawing on canvas.
   */
  public draw (fn?: DrawFn): void {
    this.activeDrawContext.clearRect(
      0,
      0,
      this.activeDrawCanvas.width,
      this.activeDrawCanvas.height
    )
    // ctx.save & ctx.restore encapsulates canvases context
    // changes inside the callback function (fn)
    this.activeDrawContext.save()

    // Callback function gets context, canvas and draw function
    // U can use drawFn to provide for the draw* functions
    fn?.(
      this.activeDrawContext,
      this.activeDrawCanvas,
      this.drawActiveDrawCallback
    )

    this.activeDrawContext.restore()
  }

  /**
   * Used by Object2D to mark the object as activated.
   * Activated object rendered on active canvas & ignored on cached.
   * Internal usage only.
   */
  public _activate (id: Object2D['id']): void {
    this._activeItems.add(id)
    this.repaintCachedItem(id)
  }

  /**
   * Returns true for active item id.
   *
   * Temporary solution cause we have legacy logic
   * that triggers view.setAnnotations on item update/create/delete
   * Instead we should use item.isActive
   * @param id
   * @returns
   */
  private isItemActive (id: Object2D['id']): boolean {
    return this._activeItems.has(id)
  }

  /**
   * Used by Object2D to deactivate the object.
   * Internal usage only.
   */
  public _deactivate (id: Object2D['id']): void {
    this._activeItems.delete(id)

    if (this.has(id)) {
      this.repaintCachedItem(id)
    }

    if (!this._activeItems.size) {
      this.activeContext.clearRect(0, 0, this.activeCanvas.width, this.activeCanvas.height)
    }
  }

  /**
   * Marks layer as changed.
   *
   * So it will be redrawn during the next render iteration.
   */
  changed (): void {
    this._hasChanges = true
  }

  changedDebounce = debounce(() => {
    this.changed()
  }, 50)

  resetMovingDebounce = debounce(() => {
    this._moving = false
  }, 50)

  clear (): void {
    this._renderPool.clear()
    this._rTreeItems.clear()
    this.changed()
  }

  destroy (): void {
    this.clear()
    this.camera.off(Camera.SCALE_CHANGED, this.onCanvasMove)
    this.camera.off(Camera.OFFSET_CHANGED, this.onCanvasMove)
    this.camera.off(Camera.SET_IMAGE, this.setCachedCanvasSize)
    this.camera.off(Camera.SET_WIDTH, this.setSizeForCanvases)
    this.camera.off(Camera.SET_HEIGHT, this.setSizeForCanvases)
    this.removeAllListeners('render')
    this.removeAllListeners('before-render')
  }

  onRender (
    cb: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => void
  ): CallbackHandle {
    this.on('render', cb)

    return {
      id: this.listenerCount('render'),
      release: this.off.bind(this, 'render', cb)
    }
  }

  onBeforeRender (
    cb: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => void
  ): CallbackHandle {
    this.on('before-render', cb)

    return {
      id: this.listenerCount('before-render'),
      release: this.off.bind(this, 'before-render', cb)
    }
  }

  /**
   * Returns Object2D instance that point hits to, respecting z-index.
   * @param point
   * @returns
   */
  public hitItemRegion (point: ImagePoint): Object2D['id'] | undefined {
    const result = this._rTreeItems.search({
      minX: point.x,
      minY: point.y,
      maxX: point.x,
      maxY: point.y
    }).sort((a, b) => {
      return (b.item.getZIndex?.() || 0) - (a.item.getZIndex?.() || 0)
    })

    for (const { item } of result) {
      if (item.containsPoint && item.containsPoint(point)) {
        return item.id
      }
    }
    return undefined
  }
}
