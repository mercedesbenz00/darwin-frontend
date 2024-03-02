import { CallbackHandle } from '@/engineCommon/callbackHandler'
import { ImagePoint } from '@/engineCommon/point'

type CanvasType = any // HTMLCanvasElement | HTMLElement | HTMLDivElement
type ContextType = any // CanvasRenderingContext2D | HTMLElement | DocumentFragment

/**
 *
 */
export type DrawFn = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  drawFn?: DrawCallback,
  /**
   * Allows drawing function to identify dynamic or static drawing
   */
  isDynamic?: boolean
) => void
/**
 *
 */
export type DrawCallback = (drawFn?: DrawFn) => void

export type Range = {
  minX: number,
  maxX: number,
  minY: number,
  maxY: number
}

export interface IObject {
  id: string
  render (context: ContextType, canvas: CanvasType, drawFn?: DrawCallback): void
  changed (): void
  activate (): void
  deactivate (): void
}

export interface ILayer {
  readonly canvas: CanvasType
  readonly context: ContextType
  readonly element: DocumentFragment
  _activate (id: IObject['id']): void
  _deactivate (id: IObject['id']): void
  add (payload: IObject): void
  add (payload: IObject[]): void
  update (itemId: IObject['id']): void
  getItem (id: string): IObject | undefined
  delete (id: string): void
  has (id: string): boolean
  render (): void
  changed (): void
  changedDebounce (): void
  draw (fn?: DrawFn): void
  clear (): void
  destroy (): void
  onRender (
    cb: (ctx: ContextType, canvas: CanvasType) => void
  ): CallbackHandle
  onBeforeRender (
    cb: (ctx: ContextType, canvas: CanvasType) => void
  ): CallbackHandle
  hitItemRegion (point: ImagePoint): IObject['id'] | undefined
}
