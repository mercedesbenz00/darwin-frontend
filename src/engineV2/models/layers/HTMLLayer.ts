import EventEmitter from 'events'

import { CallbackHandle } from '@/engineCommon/callbackHandler'

import { ILayer, IObject } from './types'

/**
 * HTML element object
 *
 * render - function will return HTML element,
 * that will be accumulated and optimized by HTMLLayer.render
 */
export class ObjectHTML implements IObject {
  id: string

  constructor (
    id: string,
    public render: (context: DocumentFragment, canvas: HTMLDivElement) => HTMLElement | undefined
  ) {
    this.id = id
  }

  changed (): void {}
  activate (): void {}
  deactivate (): void {}
}

export class HTMLLayer extends EventEmitter implements ILayer {
  private _canvas: HTMLDivElement
  private _context: DocumentFragment
  private _hasChanges: boolean = false

  private _renderPool: { [key: string]: ObjectHTML } = {}

  constructor () {
    super()

    this._canvas = document.createElement('div')
    this._context = document.createDocumentFragment()
  }

  public _activate (): void {}
  public _deactivate (): void {}
  public draw (): void {}
  public hitItemRegion (): IObject['id'] | undefined {
    return undefined
  }

  public get context (): DocumentFragment {
    if (!this._context) { throw new Error('Something went wrong! Context not set!') }

    return this._context
  }

  public get canvas (): HTMLDivElement {
    return this._canvas
  }

  public get element (): DocumentFragment {
    const frag = document.createDocumentFragment()

    frag.appendChild(this.canvas)

    return frag
  }

  /**
   * Add new object to the render pool.
   */
  add (payload: ObjectHTML): void
  add (payload: ObjectHTML[]): void
  public add (payload: ObjectHTML | ObjectHTML[]): void {
    const items = Array.isArray(payload) ? payload : [payload]

    this._hasChanges = true

    items.forEach(item => {
      this._renderPool[item.id] = item
    })
  }

  public update (): void {}

  /**
   * Remove object from the render pool by its id.
   */
  public delete (itemId: ObjectHTML['id']): void {
    this._hasChanges = true

    delete this._renderPool[itemId]
  }

  /**
   * Returns object by its id.
   */
  getItem (id: string): ObjectHTML {
    return this._renderPool[id]
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
        item.render(this.context, this.canvas)
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

  changedDebounce (): void { }

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
