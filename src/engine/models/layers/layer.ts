import EventEmitter from 'events'

import { CallbackHandle } from '@/engineCommon/callbackHandler'

import { ILayer, IObject } from './types'

export class Object2D implements IObject {
  id: string

  constructor (id: string, public render: (ctx: CanvasRenderingContext2D) => any) {
    this.id = id
  }
}

/**
 * Accumulates items for render.
 *
 * Manages rendering process of each item.
 */
export class Layer extends EventEmitter implements ILayer {
  private _canvas: HTMLCanvasElement | null
  private _context: CanvasRenderingContext2D | null
  private _hasChanges: boolean = false

  private _renderPool: { [key: string]: Object2D } = {}

  constructor () {
    super()
    this._canvas = document.createElement('canvas')
    this._context = this.canvas.getContext('2d')
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
  add (item: Object2D): void {
    this._hasChanges = true

    this._renderPool[item.id] = item
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
   * Remove object from the render pool by its id.
   */
  remove (id: string): void {
    this._hasChanges = true

    delete this._renderPool[id]
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
        item.render(this.context)
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
