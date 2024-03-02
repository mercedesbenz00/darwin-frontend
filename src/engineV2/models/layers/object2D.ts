import { ImagePoint } from '@/engineCommon/point'
import { ILayer, DrawCallback, IObject, Range } from '@/engineV2/models/layers/types'
import { BBox } from '@/engineV2/utils'

export type RTreeObject2D = Range & {
  item: Object2D
}

export class Object2D implements IObject {
  id: string

  private _layer: ILayer | undefined

  private _hasChanges: boolean = true
  private _isActive: boolean = false

  constructor (
    id: string,
    /**
     * Object 2d instance render function.
     *
     * Defines the way to render objects on each render iteration.
     */
    private _render: (
      ctx: CanvasRenderingContext2D,
      canvas: HTMLCanvasElement,
      drawFn?: DrawCallback
    ) => void,
    /**
     * Defines bbox getter function for object 2d instance.
     */
    public getBBox?: () => BBox | undefined,
    /**
     * Defines point-object intersection function.
     */
    public containsPoint?: (point: ImagePoint) => boolean,
    /**
     * Defines object instance z-index getter.
     */
    public getZIndex?: () => number | null
  ) {
    this.id = id
  }

  /**
   * Renders object 2d instance using provided render function.
   *
   * After render marks object 2d instance as unchanged.
   * @param ctx
   * @param canvas
   * @param drawFn - provides a function for an optimized draw (using an active canvas)
   */
  public render (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    drawFn?: DrawCallback
  ): void {
    this._hasChanges = false
    this._render(ctx, canvas, drawFn)
  }

  /**
   * setLayer used by ILayer instance to define parented layer.
   */
  public setLayer (layer: ILayer): void {
    this._layer = layer
  }

  changed (): void {
    this._hasChanges = true
  }

  get hasChanges (): boolean {
    return this._hasChanges
  }

  /**
   * Marks Object as activated and notifies corresponded layer about it
   */
  activate (): void {
    if (!this._isActive) {
      this._isActive = true
      this.changed()
      this._layer?._activate(this.id)
    }
  }

  /**
   * Marks Object as deactivated and notifies corresponded layer about it
   */
  deactivate (): void {
    this._isActive = false
    this.changed()
    this._layer?._deactivate(this.id)
  }

  get isActive (): boolean {
    return this._isActive
  }

  clear (): void {
    this._layer = undefined
  }
}
