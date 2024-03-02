import { EventEmitter } from 'events'

import { Editor } from '@/engineV2/editor'
import { ViewCreator, View } from '@/engineV2/views'
import { V2DatasetItemPayload } from '@/store/types/V2DatasetItemPayload'
import { V2DatasetItemSlot } from '@/store/types/V2DatasetItemSlot'

type ViewsMap = Map<string, View>

export type ViewConfig = {
  file: V2DatasetItemSlot,
  item: V2DatasetItemPayload
}

export type LayoutConfig = {
  type: 'vertical' | 'horizontal' | 'grid' | 'simple',
  views: ViewConfig[]
}

/**
 * @event activeView:changed
 */
export class Layout extends EventEmitter {
  private _activeView!: View
  private _views: Map<string, View> = new Map()
  private viewCreator: ViewCreator

  public layoutConfig: LayoutConfig

  constructor (editor: Editor, layout: LayoutConfig) {
    super()

    this.setMaxListeners(20)

    this.viewCreator = new ViewCreator(editor)
    this.layoutConfig = layout
    this.setupViews(this.layoutConfig)
  }

  public get views (): ViewsMap {
    return this._views
  }

  public get viewsList (): View[] {
    return [...this._views.values()]
  }

  public get activeView (): View {
    return this._activeView
  }

  public setActiveView (view: View): void {
    if (this.activeView === view) { return }

    this.activeView?.allLayersChanged()
    this.activeView?.removeListeners()

    this._activeView = view
    this.emit('activeView:changed', this._activeView)
    view.addListeners()
  }

  public updateViewsCameraDimensions (width?: number, height?: number): void {
    this.viewsList.forEach(view => {
      view.updateCameraDimensions(width, height)
    })
  }

  private cleanupView (key: string): void {
    const view = this.views.get(key)
    if (!view) { return }
    view.removeListeners()
    view.destroy()
    this._views.delete(key)
  }

  public setAllViewsReadonlyState (state: boolean): void {
    this.viewsList.forEach(view => {
      if (view.readonly !== state) {
        view.readonly = state
      }
    })
  }

  public cleanup (): void {
    this.viewsList.forEach(view => {
      this.cleanupView(view.id)
    })
    this._views.clear()
  }

  private setupViews (layout: LayoutConfig): void {
    layout.views.forEach((viewConfig: ViewConfig) => {
      const view = this.createView(viewConfig)
      this._views.set(view.id, view)
    })

    this.setActiveView(this.viewsList[0])
  }

  private createView (viewConfig: ViewConfig): View {
    const view = this.viewCreator.createForType(viewConfig.file, viewConfig.item)

    return view
  }
}
