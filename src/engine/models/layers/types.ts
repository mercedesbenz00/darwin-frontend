import { CallbackHandle } from '@/engineCommon/callbackHandler'

type CanvasType = HTMLCanvasElement | HTMLElement | HTMLDivElement
type ContextType = CanvasRenderingContext2D | HTMLElement | DocumentFragment

export interface IObject {
  id: string
  render (context: ContextType, canvas: CanvasType): any
}

export interface ILayer {
  readonly canvas: CanvasType
  readonly context: ContextType
  add (item: IObject): void
  getItem (id: string): IObject
  remove (id: string): void
  has (id: string): boolean
  render (): void
  changed (): void
  clear (): void
  destroy (): void
  onRender (
    cb: (ctx: ContextType, canvas: CanvasType) => void
  ): CallbackHandle
  onBeforeRender (
    cb: (ctx: ContextType, canvas: CanvasType) => void
  ): CallbackHandle
}
