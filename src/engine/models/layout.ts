import Vue from 'vue'

import { Editor } from '@/engine/editor'
import { ViewCreator, View } from '@/engine/models'
import { DatasetItemPayload } from '@/store/types'

type ViewsMap = { [key: string]: View }

type ViewConfig = {
  item: DatasetItemPayload | null,
  framesGroup?: number[] | null
}

export type LayoutConfig = {
  type: 'vertical' | 'horizontal' | 'grid' | 'single',
  views: ViewConfig[]
}

export class Layout {
  private editor: Editor
  private _activeView: View
  private _views: ViewsMap = {}
  private viewCreator: ViewCreator

  public layoutConfig: LayoutConfig

  constructor (editor: Editor, layout: LayoutConfig) {
    this.editor = editor
    this.viewCreator = new ViewCreator(this.editor)
    this._activeView = this.viewCreator.createDefaultView()
    this.layoutConfig = layout
    this.setupViews(this.layoutConfig)
  }

  public get views (): ViewsMap {
    return this._views
  }

  public get viewsList (): View[] {
    return Object.values(this._views)
  }

  public get activeView (): View {
    return this._activeView
  }

  /**
   * Checks provided config to have the same payload
   * as current layout config.
   *
   * @param {LayoutConfig} config
   * @returns {boolean}
   */
  public isSameLayoutConfig (config: LayoutConfig): boolean {
    return (
      this.layoutConfig.type === config.type &&
      this.layoutConfig.views.length === config.views.length
    )
  }

  /**
   * Manage View & Item connection.
   *
   * If current view instance does not support item type
   * it will trigger new View creation.
   * @param viewId
   * @param viewConfig
   * @returns
   */
  public async setViewConfig (
    viewId: string,
    viewConfig: ViewConfig
  ): Promise<void> {
    const view = this.views[viewId]

    if (!view) { return }

    if (view.currentItem !== null && view.currentItem.id === viewConfig.item?.id) {
      return
    }

    /**
     * Checks if item type was changed
     * to re-generate View instance
     */
    if (
      !viewConfig.item ||
      this.viewCreator.haveSameItemConstructor(view.currentItem, viewConfig.item)
    ) {
      view.annotationManager.setAnnotations([])
      await view.setItem(viewConfig.item, viewConfig.framesGroup || null)
    } else {
      this.cleanupView(viewId)

      // this will create a new view. all the renderers inside view.renderManager are reset
      const view = this.createView(viewConfig)
      Vue.set(this._views, view.id, view)

      this.setActiveView(view)

      // we solve the above issue by reinstalling all the plugin manager plugins
      // which plugins are available is a global thing, and not dependant on type
      // if view, so this should be safe
      this.editor.pluginManager.installAll(this.editor.pluginManager.installedPlugins)

      if (!this.editor.toolManager.currentTool) {
        if (this.editor.toolManager.findByName('edit_tool')) {
          this.editor.activateTool('edit_tool')
        } else {
          this.editor.activateTool('select_tool')
        }
      }

      await view.setItem(viewConfig.item, viewConfig.framesGroup || null)
    }
  }

  public setActiveView (view: View): void {
    if (this.activeView === view) { return }

    const { currentTool } = this.editor.toolManager
    if (currentTool) {
      currentTool.tool.reset(currentTool.context)
    }
    this.activeView?.allLayersChanged()
    this.activeView?.removeListeners()

    Vue.set(this, '_activeView', view)
    view.addListeners()
  }

  public updateViewsCameraDimensions (width?: number, height?: number): void {
    this.viewsList.forEach(view => {
      view.updateCameraDimensions(width, height)
    })
  }

  private cleanupView (key: string): void {
    const { currentTool } = this.editor.toolManager
    if (currentTool) {
      currentTool.tool.reset(currentTool.context)
    }
    this.views[key].removeListeners()
    this.views[key].destroy()

    Vue.delete(this._views, key)
    Vue.set(this, '_activeView', this.viewCreator.createDefaultView())
  }

  public cleanup (): void {
    this.viewsList.forEach(view => {
      this.cleanupView(view.id)
    })
    Vue.set(this, '_activeView', this.viewCreator.createDefaultView())
    Object.keys(this._views).forEach((key: string) => {
      Vue.delete(this._views, key)
    })
  }

  private setupViews (layout: LayoutConfig): void {
    layout.views.forEach((viewConfig: ViewConfig) => {
      const view = this.createView(viewConfig)
      Vue.set(this._views, view.id, view)
    })

    this.setActiveView(this.viewsList[0])

    Promise.all(this.viewsList.map((view, index) => {
      const viewConfig = layout.views[index]
      return view.setItem(viewConfig.item, viewConfig.framesGroup || null)
    }))
  }

  private createView (viewConfig: ViewConfig): View {
    const view = this.viewCreator.createForItem(viewConfig.item)

    return view
  }
}
