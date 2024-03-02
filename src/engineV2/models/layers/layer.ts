import EventEmitter from 'events'

import { CallbackHandle } from '@/engineCommon/callbackHandler'
import { Camera } from '@/engineCommon/camera'
import { FeatureFlagsManager } from '@/engineV2/managers/featureFlagsManager'
import { Object2D } from '@/engineV2/models'
import { DrawFn } from '@/engineV2/models/layers/types'

import { ILayer } from './types'

/**
 * Accumulates items for render.
 *
 * Manages rendering process of each item.
 */
export class Layer extends EventEmitter implements ILayer {
  private _canvas: HTMLCanvasElement | null
  private _context: CanvasRenderingContext2D | null
  protected _hasChanges: boolean = false

  protected _renderPool: { [key: string]: Object2D } = {}

  constructor (camera: Camera) {
    super()
    this._canvas = document.createElement('canvas')
    this._context = this.canvas.getContext('2d')

    if (FeatureFlagsManager.isOnLayerV2) {
      // Layer itself defines when to re-render
      // for panning or scaling.
      camera.on(Camera.SCALE_CHANGED, () => {
        this.changed()
      })

      camera.on(Camera.OFFSET_CHANGED, () => {
        this.changed()
      })
    }
  }

  public changedDebounce (): void {}
  public _activate (): void {}
  public _deactivate (): void {}
  public hitItemRegion (): Object2D['id'] | undefined {
    return undefined
  }

  /**
   * Public interface that manages drawing on canvas.
   */
  public draw (fn?: DrawFn): void {
    this.context.clearRect(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    )
    // ctx.save & ctx.restore encapsulates canvases context 
    // changes inside the callback function (fn)
    this.context.save()

    // Callback function gets context, canvas and draw function
    fn?.(
      this.context,
      this.canvas,
      // Draw function provides context and canvas
      // U can use drawFn to provide for the draw* functions
      (drawFn?: DrawFn): void => {
        drawFn?.(this.context, this.canvas, undefined, true)
      }
    )

    this.context.restore()
  }

  public get element (): DocumentFragment {
    const frag = document.createDocumentFragment()
    frag.appendChild(this.canvas)
    return frag
  }

  public get context (): CanvasRenderingContext2D {
    if (!this._context) { throw new Error('Something went wrong! Context not set!') }

    return this._context
  }

  public get canvas (): HTMLCanvasElement {
    if (!this._canvas) { throw new Error('Canvas was removed!') }

    return this._canvas
  }

  /**
   * Add new object to the render pool.
   */
  add (payload: Object2D): void
  add (payload: Object2D[]): void
  add (payload: Object2D | Object2D[]): void {
    const items = Array.isArray(payload) ? payload : [payload]

    this._hasChanges = true

    items.forEach(item => {
      this._renderPool[item.id] = item
    })
  }

  update (): void {}

  /**
   * Remove object from the render pool by its id.
   */
  delete (id: string): void {
    this._hasChanges = true

    delete this._renderPool[id]
  }

  /**
   * Returns object by its id.
   */
  getItem (id: string): Object2D {
    return this._renderPool[id]
  }

  getAll (): { key: string, item: Object2D }[] {
    return Object.keys(this._renderPool).map(key => ({
      key,
      item: this._renderPool[key]
    }))
  }

  /**
   * Checks if the object with id exists on the layer.
   */
  has (id: string): boolean {
    return !!this._renderPool[id]
  }

  /**
   * Renders each item in the pool.
   *
   * If the layer has no changes it will skip re-render iteration.
   */
  render (): void {
    if (!this.context) { return }
    if (!this._hasChanges) { return }

    this._hasChanges = false

    this.emit('before-render', this.context, this.canvas)

    Object.values(this._renderPool).forEach(item => {
      try {
        item.render(
          this.context,
          this.canvas,
          (drawFn?: DrawFn): void => {
            drawFn?.(this.context, this.canvas, undefined, true)
          }
        )
      } catch (e: unknown) {
        console.error(e)
      }
    })

    this.emit('render', this.context, this.canvas)
  }

  /**
   * Marks layer as changed.
   *
   * So it will be redrawn during the next render iteration.
   */
  changed (): void {
    this._hasChanges = true
  }

  clear (): void {
    this._renderPool = {}
    this._hasChanges = true
  }

  destroy (): void {
    this.clear()
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
}
