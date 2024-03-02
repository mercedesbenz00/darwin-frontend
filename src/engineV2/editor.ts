import { EventEmitter } from 'events'

import { Store } from 'vuex'

import { CallbackHandle } from '@/engineCommon/callbackHandler'
import { ImageManipulationFilter } from '@/engineCommon/imageManipulation'
import { CanvasPoint } from '@/engineCommon/point'
import ClassDialog from '@/engineV2/ClassDialog'
import { EditorCursor } from '@/engineV2/EditorCursor'
import { Layout, LayoutConfig } from '@/engineV2/layout'
import {
  ActionManager,
  HotkeyManager,
  PluginManager,
  SerializerManager,
  AutoAnnotateManager,
  ToolManager,
  ItemManager
} from '@/engineV2/managers'
import { PluginConfig } from '@/engineV2/managers/pluginManagerInterfaces'
import { View } from '@/engineV2/views'
import {
  RootState,
  RunningSessionPayload,
  V2DatasetItemPayload
} from '@/store/types'

import { ICommentsProvider } from './iproviders/types'
import { Providers } from './iproviders/types'
import { FeatureFlags, FeatureFlagsManager } from './managers/featureFlagsManager'

type CallbackFunctionVariadic = (...args: any[]) => void;

export type EditorConfig = {
  flags?: FeatureFlags,
  /**
   * A set of interfaces used to CRUD comments, for now, later annotations, etc.
   * Long term this is how Edtior saves data without relying on Vuex or Pinia.
   * @see https://www.notion.so/v7labs/Providers-6b7ca33689bc4b1581dbb36af7411702
   * @see https://www.notion.so/v7labs/Road-to-embeddable-editor-9ba58d785db34bafb96386ab436a071d
   */
  providers: Providers
}

/**
 * @event layout:changed
 * @event showFramesTool:changed
 */
export class Editor extends EventEmitter {
  public readonly version = '2.0'
  protected onCleanup: Function[] = []

  public layout: Layout

  protected static RERENDER_LIMIT = 50

  public actionManager: ActionManager
  public hotkeyManager: HotkeyManager
  public pluginManager: PluginManager
  public serializerManager: SerializerManager
  public autoAnnotateManager: AutoAnnotateManager
  public toolManager: ToolManager
  public classDialog: ClassDialog
  public itemManager: ItemManager

  public embedded: boolean = false

  private commands = new Map<string, CallbackFunctionVariadic>()
  protected renderAnimationFrameID: number = -1

  public store: Store<RootState>

  // Mandatory for CommentsV2
  public readonly commentsProvider: ICommentsProvider

  constructor (
    store: Store<RootState>,
    layout: LayoutConfig,
    config: EditorConfig
  ) {
    super()

    this.store = store

    if (config?.flags) { FeatureFlagsManager.setFlags(config.flags) }

    // in use by COMMENTS_V2 feature flag
    this.commentsProvider = config.providers.commentsProvider

    this.pluginManager = new PluginManager(this)
    this.toolManager = new ToolManager(this)
    this.hotkeyManager = new HotkeyManager(this)
    this.autoAnnotateManager = new AutoAnnotateManager(this)
    this.serializerManager = new SerializerManager()
    this.actionManager = new ActionManager()
    this.classDialog = new ClassDialog()
    this.itemManager = new ItemManager()

    this.layout = new Layout(this, layout)
  }

  public init (layout: LayoutConfig, embedded: boolean = false): void {
    this.cleanup()

    this.layout = new Layout(this, layout)
    this.emit('layout:changed', this.layout)

    this.toolManager.defineAvailableTools(this.itemManager.currentItem)

    this.hotkeyManager.registerDefaultHotkeyListeners()
    this.hotkeyManager.registerAnnotationClassHotkeys()

    this.embedded = embedded

    if (!this.itemManager.currentItem) { return }

    this._handleActiveViewChange(this.activeView)
    this.layout.on('activeView:changed', this._handleActiveViewChange)

    this.render()
  }

  private _handleActiveViewChange = (view: View): void => {
    this.layout.viewsList.forEach(view => {
      view.off('readonly:changed', this._handleReadonlyChange)
    })

    this._handleReadonlyChange()
    view.on('readonly:changed', this._handleReadonlyChange)
  }

  private _handleReadonlyChange = (): void => {
    this.toolManager.defineAvailableTools(this.itemManager.currentItem)
  }

  get activeView (): View {
    return this.layout.activeView
  }

  get views (): Map<string, View> {
    return this.layout.views
  }

  public get viewsList (): View[] {
    return this.layout.viewsList
  }

  public render (): void {
    this.layout.viewsList.forEach(view => {
      view.render()
    })

    this.renderAnimationFrameID = requestAnimationFrame(() => {
      this.render()
    })
  }

  /**
   * Installs plugins into plugin manager, and then links editor with the store.
   *
   * The two actions always need to be executed in that order, or we
   * get unexpected behavior, unnecessary re-renders or even errors.
   */
  public installAllPlugins (plugins: PluginConfig[]): void {
    this.pluginManager.installAll(plugins)
  }

  public disableEditSubAnnotations (): void {
    this.viewsList.forEach(view => {
      view.renderManager.editSubAnnotations = false
    })
  }

  public disableAnnotationOverlays (): void {
    this.viewsList.forEach(view => {
      view.disableAnnotationOverlays()
    })
  }

  public enableAnnotationOverlays (): void {
    this.viewsList.forEach(view => {
      view.enableAnnotationOverlays()
    })
  }

  public get hasCurrentItem (): boolean {
    return !!this.itemManager.currentItem
  }

  get currentItem (): V2DatasetItemPayload | null {
    return this.itemManager.currentItem
  }

  setImageFilter (filter: ImageManipulationFilter): void {
    this.viewsList.forEach(view => {
      view.setImageFilter(filter)
    })
  }

  lqJumpToFrame (frameIndex: number): void {
    this.activeView.jumpToFrame(frameIndex)
  }

  jumpToFrame (frameIndex: number, resetZoom: boolean = false): void {
    this.activeView.jumpToFrame(frameIndex, resetZoom)
  }

  selectCursor (cursorClass: EditorCursor, text?: string, canvasPoint?: CanvasPoint): void {
    // TODO: Ideally should be something better then get element by ...
    const el = document.getElementById('workview-canvas')
    if (!el) { return }

    // It's important to check the classList here.
    // Without it, the cursor will be removed and re-added on every
    // mousemove, which is a hefty performance cost.
    if (!el.classList.contains(cursorClass)) {
      this.clearCursor(el)
      el.classList.add(cursorClass)
    }

    const child = el.getElementsByClassName('workview__cursor-helper')[0]
    if (!canvasPoint && child) {
      el.removeChild(child)
      return
    }

    if (text && canvasPoint) {
      const child = el.getElementsByClassName('workview__cursor-helper').item(0) as HTMLDivElement
      if (child) {
        child.textContent = text
        child.style.left = `${canvasPoint.x + 15}px`
        child.style.top = `${canvasPoint.y - 15}px`
        return
      }

      const otherDiv = document.createElement('div')
      otherDiv.classList.add('workview__cursor-helper')
      otherDiv.textContent = text
      otherDiv.style.position = 'absolute'
      otherDiv.style.background = 'rgba(0, 61, 184, 0.7)'
      otherDiv.style.color = 'white'
      otherDiv.style.padding = '3px 5px'
      otherDiv.style.zIndex = '1000'
      otherDiv.style.fontSize = '10px'
      otherDiv.style.borderRadius = '3px'
      otherDiv.style.pointerEvents = 'none'
      otherDiv.style.left = `${canvasPoint.x + 10}px`
      otherDiv.style.top = `${canvasPoint.y - 20}px`
      el.prepend(otherDiv)
    }
  }

  private clearCursor (el: Element): void {
    Object.values(EditorCursor).forEach((value: string) => {
      el.classList.remove(value)
    })
  }

  public registerCommand (name: string, action: ((...args: any[]) => void)): void {
    this.commands.set(name, action)
  }

  public unregisterCommand (name: string): void {
    this.commands.delete(name)
  }

  public callCommand (name: string, ...args: any[]): void {
    if (this.commands.has(name)) {
      this.commands.get(name)!(...args)
    } else {
      console.warn(`No plugin registered for command ${name}`)
    }
  }

  // START::Callbacks
  public onModelsChanged (cb: (models: RunningSessionPayload[]) => void): CallbackHandle[] {
    return this.viewsList.map(view => view.onModelsChanged(cb))
  }

  public onDoubleClick (cb: (event: MouseEvent) => void): CallbackHandle[] {
    return this.viewsList.map(view => view.onDoubleClick(cb))
  }

  public onMouseDown (cb: (event: MouseEvent) => void): CallbackHandle[] {
    return this.viewsList.map(view => view.onMouseDown(cb))
  }

  public onMouseUp (cb: (event: MouseEvent) => void): CallbackHandle[] {
    return this.viewsList.map(view => view.onMouseUp(cb))
  }

  public onMouseMove (cb: (event: MouseEvent) => void): CallbackHandle[] {
    return this.viewsList.map(view => view.onMouseMove(cb))
  }

  public onMouseLeave (cb: (event: MouseEvent) => void): CallbackHandle[] {
    return this.viewsList.map(view => view.onMouseLeave(cb))
  }

  public onGestureStart (cb: (event: Event) => void): CallbackHandle[] {
    return this.viewsList.map(view => view.onGestureStart(cb))
  }

  public onGestureChange (cb: (event: Event) => void): CallbackHandle[] {
    return this.viewsList.map(view => view.onGestureChange(cb))
  }

  public onGestureEnd (cb: (event: Event) => void): CallbackHandle[] {
    return this.viewsList.map(view => view.onGestureEnd(cb))
  }

  public onWheel (cb: (event: WheelEvent) => void): CallbackHandle[] {
    return this.viewsList.map(view => view.onWheel(cb))
  }

  public onTouchStart (cb: (event: TouchEvent) => void): CallbackHandle[] {
    return this.viewsList.map(view => view.onTouchStart(cb))
  }

  public onTouchEnd (cb: (event: TouchEvent) => void): CallbackHandle[] {
    return this.viewsList.map(view => view.onTouchEnd(cb))
  }

  public onTouchMove (cb: (event: TouchEvent) => void): CallbackHandle[] {
    return this.viewsList.map(view => view.onTouchMove(cb))
  }

  public onKeyDown (cb: (event: KeyboardEvent) => void): CallbackHandle[] {
    return this.viewsList.map(view => view.onKeyDown(cb))
  }

  public onKeyPress (cb: (event: KeyboardEvent) => void): CallbackHandle[] {
    return this.viewsList.map(view => view.onKeyPress(cb))
  }

  public onKeyUp (cb: (event: KeyboardEvent) => void): CallbackHandle[] {
    return this.viewsList.map(view => view.onKeyUp(cb))
  }
  // END::Callbacks

  public cleanup (): void {
    this.layout.viewsList.forEach(view => {
      view.off('readonly:changed', this._handleReadonlyChange)
    })
    this.layout.off('activeView:changed', this._handleActiveViewChange)
    this.layout.cleanup()
    this.pluginManager.cleanup()
    this.hotkeyManager.cleanup()
    this.onCleanup.forEach(callback => callback())
    window.cancelAnimationFrame(this.renderAnimationFrameID)
  }
}
