import { Store } from 'vuex'

import { IEditor } from '@/engine/IEditor'
import { IView, VideoSubAnnotationDataPayload } from '@/engine/models/views/types'
import { AnnotationClass } from '@/engineCommon/AnnotationClass'
import { AnnotationType } from '@/engineCommon/AnnotationType'
import { CallbackHandle } from '@/engineCommon/callbackHandler'
import { Camera } from '@/engineCommon/camera'
import { getZoomWindow } from '@/engineCommon/getZoomWindow'
import { ImageManipulationFilter, WindowLevels } from '@/engineCommon/imageManipulation'
import { EditableImagePoint, ImagePoint, CanvasPoint } from '@/engineCommon/point'
import { Toast } from '@/engineCommon/toast'
import {
  ClassMapping,
  LoadedVideo,
  RenderableImage,
  StageAnnotation
} from '@/store/modules/workview/types'
import {
  AnnotationTypeName,
  AnnotationTypePayload,
  DatasetItemPayload,
  LayoutConfig,
  MeasureRegionsPayload,
  ModelType,
  RootState,
  RunningSessionPayload
} from '@/store/types'

import ClassDialog from './ClassDialog'
import { EditorCursor } from './EditorCursor'
import {
  addAnnotationAction,
  changeAnnotationClass
} from './actions'
import {
  ActionManager,
  AnnotationOverlayer,
  AnnotationManager,
  AnnotationTypeSerializer,
  HotkeyManager,
  MeasureOverlayer,
  PluginConfig,
  PluginManager,
  SerializerManager,
  SubAnnotationToolPayload,
  Tool,
  ToolInfo,
  ToolManager,
  ItemManager
} from './managers'
import { IAnnotationManager } from './managers/IAnnotationManager'
import {
  Annotation,
  AnnotationData,
  AnnotationTypeRenderer,
  CreateAnnotationParams,
  LoadedImageWithTiles,
  Layout,
  View
} from './models'
import { isSubAnnotationTool } from './utils'

type CallbackFunctionVariadic = (...args: any[]) => void;

export class EditorError extends Error {
  constructor (message: string) {
    super(`Editor: ${message}`)
  }
}

export class Editor implements IEditor {
  public layout: Layout

  protected static RERENDER_LIMIT = 50

  public actionManager: ActionManager
  public hotkeyManager: HotkeyManager
  public pluginManager: PluginManager
  public serializerManager: SerializerManager
  public toolManager: ToolManager
  public classDialog: ClassDialog

  public readonly version: '1.0' | '2.0' = '1.0'

  public embedded: boolean = false

  private commands = new Map<string, CallbackFunctionVariadic>()
  private renderAnimationFrameID: number = -1

  public store: Store<RootState>

  constructor (
    public itemManager: ItemManager,
    store: Store<RootState>
  ) {
    this.store = store

    this.pluginManager = new PluginManager(this)
    this.toolManager = new ToolManager(this)
    this.hotkeyManager = new HotkeyManager(this)
    this.serializerManager = new SerializerManager()
    this.actionManager = new ActionManager()
    this.classDialog = new ClassDialog()

    this.actionManager.on('action', () => { this.store.dispatch('workviewTracker/reportActivity') })

    this.layout = new Layout(this, {
      type: 'single',
      views: [{ item: null }]
    })

    this.itemManager.onItemChange((item) => {
      this.setItem(item)
    })
  }

  buildAnnotationManager (view: IView): IAnnotationManager {
    return new AnnotationManager(view)
  }

  public init (embedded: boolean = false): void {
    this.cleanup()

    this.hotkeyManager.registerDefaultHotkeyListeners()
    this.hotkeyManager.registerAnnotationClassHotkeys()

    this.embedded = embedded

    // Layout require editors features
    this.layout = new Layout(this, {
      type: 'single',
      views: [{
        item: this.store.state.workview.selectedDatasetItem
      }]
    })

    this.render()
  }

  public setupLayout (layout: LayoutConfig): void {
    const installedPlugins = this.pluginManager.installedPlugins
    this.cleanup()
    this.hotkeyManager.registerDefaultHotkeyListeners()
    this.hotkeyManager.registerAnnotationClassHotkeys()
    
    this.layout = new Layout(this, layout)
    // we solve issue which plugin tools are not shown
    // by reinstalling all the plugin manager plugins
    // which plugins are available is a global thing, and not dependant on type
    this.pluginManager.installAll(installedPlugins)
    this.render()
  }

  get views (): { [key: string]: View } {
    return this.layout.views
  }

  public get viewsList (): View[] {
    return this.layout.viewsList
  }

  get activeView (): View {
    return this.layout.activeView
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

  get cameraScale (): number {
    return this.activeView.camera.scale
  }

  get isResetZoom (): boolean {
    return !!this.activeView.isResetZoom
  }

  get camera (): Camera {
    return this.activeView.camera
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
    return !!this.activeView.hasCurrentItem
  }

  get currentItem (): DatasetItemPayload | null {
    return this.activeView.currentItem || null
  }

  get loadedImage (): LoadedImageWithTiles | null {
    return this.activeView.loadedImage || null
  }

  set loadedImage (value: LoadedImageWithTiles | null) {
    this.activeView.loadedImage = value
  }

  get loadedVideo (): LoadedVideo | null {
    return this.activeView.loadedVideo || null
  }

  set loadedVideo (value: LoadedVideo | null) {
    this.activeView.loadedVideo = value
  }

  get renderingImage (): RenderableImage | null {
    return this.activeView.renderingImage || null
  }

  get windowLevelsRange (): WindowLevels | null {
    return this.activeView.windowLevelsRange || null
  }

  get measureRegion (): MeasureRegionsPayload | null {
    return this.activeView.measureRegion || null
  }

  renderHistogram (canvas: HTMLCanvasElement): void {
    this.activeView.renderHistogram(canvas)
  }

  setImageFilter (filter: ImageManipulationFilter): void {
    this.viewsList.forEach(view => {
      view.setImageFilter(filter)
    })
  }

  isFrameIndexValid (frameIndex: number): boolean {
    return this.activeView.isFrameIndexValid(frameIndex)
  }

  jumpToFrame (frameIndex: number, resetZoom: boolean = false): void {
    this.viewsList
      .map(view => (
        view.jumpToFrame(frameIndex, resetZoom)
      ))
  }

  setItem (item: DatasetItemPayload | null): void {
    this.layout.viewsList.forEach(async (view, index) => {
      await this.layout.setViewConfig(
        view.id,
        {
          item,
          framesGroup: item?.dataset_video?.metadata?.layout?.groups[index] || null
        }
      )
    })
  }

  public initializeSubAnnotation (
    type: AnnotationTypeName,
    parent: Annotation,
    data: AnnotationData
  ): Annotation | null {
    return Annotation.createSubAnnotation(this.activeView, { parent, data, type })
  }

  public updateAnnotationData (annotation: Annotation, data: AnnotationData): void {
    annotation.data = data
  }

  saveAnnotation (annotation: Annotation): void {
    this.actionManager.do(addAnnotationAction(this, annotation))
  }

  public activateTool (name: string, payload?: { sub: SubAnnotationToolPayload }): void {
    const { currentTool: tool } = this.toolManager
    if (tool && tool.name === name) {
      if (isSubAnnotationTool(tool.tool) && payload) {
        const { master: masterAnnotation } = payload.sub
        if (tool.tool.masterAnnotation !== masterAnnotation) {
          tool.tool.selectMasterAnnotation(tool.context, masterAnnotation)
        }
      }
      return
    }

    this.toolManager.activateTool(name, payload)

    if (name !== 'brush_tool') {
      this.deselectAllAnnotations()
    }

    const newTool = this.toolManager.currentTool
    if (!newTool) { return }

    this.store.commit('workview/SET_CURRENT_TOOL', newTool.name)

    const types = this.toolManager.currentAnnotationTypes()
    this.store.commit('workview/SET_TOOL_ANNOTATION_TYPES', types)

    this.autoSelectClass()

    this.activeView.annotationsLayer.changed()
  }

  /**
   * Activate a ToolOption by ID.
   * If that ToolOption belongs to any category,
   * deactivate all the other ToolOptions in that category.
   *
   * @param toolOptionId the ID of the ToolOption to be activated
   */
  public activateToolOption (toolOptionId: string): void {
    const { currentTool: tool } = this.toolManager
    if (!tool) { return }

    const optionByName = (tool.toolConfig.toolOptions || [])
      .find(option => option.id === toolOptionId)
    if (!optionByName) { return }

    const { category } = optionByName
    if (category) {
      (tool.toolConfig.toolOptions || [])
        .filter(toolOption => toolOption.category === category)
        .forEach(toolOption => { toolOption.active = false })
    }

    optionByName.active = true
  }

  public deactivateToolOption (toolOptionId: string): void {
    const { currentTool: tool } = this.toolManager
    if (!tool) { return }

    const optionByName = (tool.toolConfig.toolOptions || [])
      .find(option => option.id === toolOptionId)
    if (!optionByName) { return }

    optionByName.active = false
  }

  public deactivateToolOptions (): void {
    const { currentTool: tool } = this.toolManager
    if (!tool) { return }
    if (!tool.toolConfig.toolOptions) { return }

    tool.toolConfig.toolOptions.forEach(toolOption => { toolOption.active = false })
  }

  public setToolOptionProps (name: string, props: object): void {
    const { currentTool: tool } = this.toolManager
    if (!tool) { return }

    const toolOption = (tool.toolConfig.toolOptions || []).find(option => option.id === name)
    if (!toolOption) { return }

    toolOption.props = props
  }

  /**
   * Delegate to a store getter which infers the main annotation type of a class
   */
  public getMainAnnotationTypeForClass (aClass: AnnotationClass): AnnotationTypePayload {
    return this.store.getters['aclass/mainAnnotationTypeForClass'](aClass)
  }

  /**
   * Delegate to a store getter which infers the sub annotation types of a class
   */
  public getSubAnnotationTypesForClass (aClass: AnnotationClass): AnnotationType[] {
    return this.store.getters['aclass/subAnnotationTypesForClass'](aClass)
  }

  /**
   * Changes the class of the currently selected annotation, if allowed
   *
   * Class change can only happen if the new class is of the same main type as the old class
   */
  public maybeChangeSelectedAnnotationClass (newClass: AnnotationClass): boolean {
    const { selectedAnnotation } = this
    if (!selectedAnnotation) { return false }

    const currentClass = selectedAnnotation.annotationClass
    if (!currentClass || currentClass.id === newClass.id) { return false }

    const currentMainType = this.getMainAnnotationTypeForClass(currentClass)
    const newMainType = this.getMainAnnotationTypeForClass(newClass)

    if (newMainType.name === 'tag') { return false }
    if (currentMainType.name !== newMainType.name) { return false }

    this.actionManager.do(changeAnnotationClass(this, selectedAnnotation, newClass))
    return true
  }

  private autoSelectClass (): void {
    const { selectedAnnotation, toolManager } = this
    const { currentTool } = this.toolManager
    if (currentTool && currentTool.name === 'edit_tool') {
      const types = toolManager.currentAnnotationTypes()
      this.store.commit('workview/SET_TOOL_ANNOTATION_TYPES', types)

      if (selectedAnnotation) {
        this.store.commit(
          'workview/PRESELECT_CLASS_ID_WITHOUT_TOOL_CHANGE',
          selectedAnnotation.classId
        )
      }
    }
  }

  /**
   * Automatically activates appropriate tool in the editor
   *
   * This happens upon tool selection from sidebar, or class selection from top
   * bar.
   */
  public autoActivateTool (): void {
    const { preselectedAnnotationClass } = this.activeView
    if (!preselectedAnnotationClass) { return }
    this.activateToolForType(preselectedAnnotationClass)
  }

  private activateToolForType (annotationClass: AnnotationClass): void {
    const type = this.getMainAnnotationTypeForClass(annotationClass)

    const tools: ToolInfo[] = []
    for (const plugin of this.pluginManager.installedPlugins) {
      for (const tool of plugin.tools) {
        if (!tool.annotationTypes.includes(type.name)) { continue }
        const entry = this.toolManager.availableTools.find(t => t.name === tool.name)
        if (!entry) { continue }
        tools.push(entry)
      }
    }

    const currentTool = this.toolManager.currentTool
    if (tools.length === 0) { return }
    // This way we are prioritizing picking the current tool if possible
    const tool = tools.find(t => currentTool && t.name === currentTool.name) || tools[0]
    this.store.commit(
      'workview/PRESELECT_CLASS_ID_FOR_TOOL',
      { classId: annotationClass.id, tool: tool.name }
    )
    this.activateTool(tool.name)
  }

  get autoAnnotateModels (): RunningSessionPayload[] {
    return this.store.state.workview.autoAnnotateModels
  }

  public get preselectedAutoAnnotateModel (): RunningSessionPayload | null {
    const { preselectedModelId: id } = this.store.state.workview
    const { autoAnnotateModels } = this
    return autoAnnotateModels.find(m => m.id === id) || null
  }

  public get clickerEpsilon (): number {
    return this.store.state.workview.clickerEpsilon
  }

  /**
   * Automatically preselects a neural model if one isn't already selected.
   *
   * If a model of type `ModelType.AutoAnnotation` exists, select that, otherwise
   * select the first model among the available ones.
   */
  setPreselectedAutoAnnotateModel (): void {
    const { preselectedModelId } = this.store.state.workview
    if (preselectedModelId) { return }

    const { autoAnnotateModels } = this
    if (autoAnnotateModels.length === 0) { return }

    const { trainedModels } = this.store.state.neuralModel
    const autoAnnotate = autoAnnotateModels.find(autoAnnotateModel => {
      const trainedModel = trainedModels.find(tm => tm.id === autoAnnotateModel.trained_model_id)
      if (!trainedModel) { return false }
      return trainedModel.model_template.type === ModelType.AutoAnnotation
    })

    const preselectedModel = autoAnnotate || autoAnnotateModels[0]
    this.store.commit('workview/SET_CURRENT_TOOL_PRESELECTED_MODEL_ID', preselectedModel.id)
  }

  get preselectedModelClassMapping (): ClassMapping {
    const { preselectedAutoAnnotateModel } = this
    if (!preselectedAutoAnnotateModel) { return [] }

    const autoAnnotateClassMapping = this.store.state.workview.classMapping
    if (!(preselectedAutoAnnotateModel.id in autoAnnotateClassMapping)) { return [] }

    return autoAnnotateClassMapping[preselectedAutoAnnotateModel.id]
  }

  findTopAnnotationAt (
    point: ImagePoint,
    filter?: (annotation: Annotation) => boolean
  ): Annotation | undefined {
    return this.activeView.findTopAnnotationAt(point, filter)
  }

  isPointOnPath (point: ImagePoint, path: EditableImagePoint[]): boolean {
    return !!this.activeView.isPointOnPath(point, path)
  }

  isPointOnPaths (point: ImagePoint, paths: EditableImagePoint[][]): boolean {
    return !!this.activeView.isPointOnPaths(point, paths)
  }

  isPointInPath (point: ImagePoint, path: EditableImagePoint[]): boolean {
    return !!this.activeView.isPointInPath(point, path)
  }

  isPointInPath2D (path2D: Path2D, point: ImagePoint): boolean {
    return !!this.activeView.isPointInPath2D(path2D, point)
  }

  findVertexAtPath (
    paths: EditableImagePoint[][],
    point: ImagePoint,
    threshold?: number
  ): EditableImagePoint | undefined {
    return this.activeView.findVertexAtPath(paths, point, threshold)
  }

  public findAnnotationVertexAt (
    point: ImagePoint,
    threshold?: number
  ): EditableImagePoint | undefined {
    return this.activeView.findAnnotationVertexAt(point, threshold)
  }

  hasAnnotation (annotation: Annotation): boolean {
    return this.activeView.hasAnnotation(annotation)
  }

  unhighlightAllVerticesInPath (paths: EditableImagePoint[][]): void {
    this.activeView.unhighlightAllVerticesInPath(paths)
  }

  unhighlightAllAnnotationsVertices (): void {
    this.activeView.unhighlightAllAnnotationsVertices()
  }

  unhighlightAllVertices (): void {
    this.activeView.unhighlightAllVertices()
  }

  deselectAllVerticesInPath (paths: EditableImagePoint[][]): void {
    this.activeView.deselectAllVerticesInPath(paths)
  }

  unhighlightAllAnnotations (): void {
    this.activeView.unhighlightAllAnnotations()
  }

  deselectAllAnnotations (): void {
    this.activeView.deselectAllAnnotations()
  }

  deselectAllVertices (): void {
    this.activeView.deselectAllVertices()
  }

  unhighlightAll (): void {
    this.activeView.unhighlightAll()
  }

  deselectAll (): void {
    this.activeView.deselectAll()
  }

  get selectedAnnotation (): Annotation | undefined {
    return this.activeView.selectedAnnotation
  }

  get selectedVertex (): EditableImagePoint | undefined {
    return this.activeView.selectedVertex
  }

  get visibleAnnotations (): Annotation[] {
    return this.activeView.visibleAnnotations || []
  }

  get mainAnnotations (): Annotation[] {
    return this.activeView.mainAnnotations || []
  }

  get visibleMainAnnotations (): Annotation[] {
    return this.activeView.visibleMainAnnotations || []
  }

  get visibleNonTagAnnotations (): Annotation[] {
    return this.activeView.visibleNonTagAnnotations || []
  }

  get highlightedAnnotations (): Annotation[] {
    return this.activeView.highlightedAnnotations || []
  }

  get highlightedVertices (): EditableImagePoint[] {
    return this.activeView.highlightedVertices || []
  }

  toast (toast: Toast): void {
    const action = `toast/${toast.isError ? 'warning' : 'notify'}`
    this.store.dispatch(action, { content: toast.message })
  }

  get selectedAnnotationVertices (): EditableImagePoint[] {
    return this.activeView.selectedAnnotationVertices || []
  }

  selectPreviousVertex (): void {
    this.activeView.selectPreviousVertex()
  }

  selectNextVertex (): void {
    this.activeView.selectNextVertex()
  }

  selectPreviousAnnotation (): Annotation | null {
    return this.activeView.selectPreviousAnnotation()
  }

  selectNextAnnotation (): Annotation | null {
    return this.activeView.selectNextAnnotation()
  }

  zoomToAnnotation (annotation: Annotation): void {
    const { type } = annotation
    const renderer = this.activeView.renderManager.rendererFor(type)
    if (!renderer || !('getAllVertices' in renderer)) { return }

    const vertices = renderer.getAllVertices(annotation, this.activeView)
    if (vertices.length === 0) { return }

    const { width, height } = this.camera.image
    const { topLeft, bottomRight } = getZoomWindow(vertices, width, height, 0.1)

    this.activeView.zoomTo(topLeft, bottomRight)
  }

  moveSelectedAnnotation (offset: ImagePoint): void {
    return this.activeView.moveSelectedAnnotation(offset)
  }

  toggleAnnotations (): void {
    this.store.commit('workview/TOGGLE_ANNOTATIONS')
  }

  toggleSubAnnotations (): void {
    this.store.commit('workview/TOGGLE_SUBANNOTATIONS')
  }

  toggleMeasures (): void {
    this.store.commit('workview/TOGGLE_MEASURES')
  }

  get showAnnotations (): boolean {
    if (!this.embedded) { return true }
    return this.store.state.workview.renderAnnotations
  }

  get showSubAnnotations (): boolean {
    if (!this.embedded) { return true }
    return this.store.state.workview.renderSubAnnotations
  }

  get showMeasures (): boolean {
    return this.store.state.workview.renderMeasures
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

  public resolveAnnotationType (
    stageAnnotation: StageAnnotation,
    view?: IView
  ): AnnotationTypeName | null {
    const { mainAnnotationTypes } = view || this.activeView

    let data
    if ('frames' in stageAnnotation.data) {
      const frames: AnnotationData = Object.values(stageAnnotation.data.frames)
      if (frames.length === 0) { return null }
      data = frames[0]
    } else {
      data = stageAnnotation.data
    }

    const type = (Object.keys(data) as AnnotationTypeName[])
      .find(t => mainAnnotationTypes.includes(t))

    return type || null
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

  public render (): void {
    this.layout.viewsList.forEach(view => {
      view.render()
    })

    this.renderAnimationFrameID = requestAnimationFrame(() => {
      this.render()
    })
  }

  public scaleToFit (): void {
    this.viewsList.forEach(view => {
      view.scaleToFit()
    })
  }

  public activateCallbacks (): void {
    this.viewsList.forEach(view => {
      view.activateCallbacks()
    })
  }

  public deactivateCallbacks (): void {
    this.viewsList.forEach(view => {
      view.deactivateCallbacks()
    })
  }

  // Callbacks
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

  public addComponent (params: { id: string, name: string, props: any }): void {
    return this.activeView.addComponent(params)
  }

  public removeComponent (id: string): void {
    return this.activeView.removeComponent(id)
  }

  inferVideoSubAnnotations (annotation: Annotation): Annotation[] {
    return this.activeView.inferVideoSubAnnotations(annotation) || []
  }

  getVideoSubAnnotationData (annotation: Annotation): VideoSubAnnotationDataPayload {
    return this.activeView.getVideoSubAnnotationData(annotation)
  }

  inferVideoAnnotationDataOnly (
    annotationData: AnnotationData,
    annotationType: string
  ): AnnotationData {
    return this.activeView.inferVideoAnnotationDataOnly(annotationData, annotationType) || {}
  }

  inferVideoSubAnnotationDataOnly (annotationData: AnnotationData): AnnotationData {
    return this.activeView.inferVideoSubAnnotationDataOnly(annotationData) || []
  }

  preselectedAnnotationClassColor (alpha: number = 1.0): string {
    return this.activeView.preselectedAnnotationClassColor(alpha) || ''
  }

  selectedAnnotationClassColor (alpha: number = 1.0): string {
    return this.activeView.selectedAnnotationClassColor(alpha) || ''
  }

  /**
   * START: Video controls
   */
  public get isPlaying (): boolean {
    return !!this.activeView.isPlaying
  }

  playVideo (): Promise<void[]> {
    return Promise.all(this.viewsList.map(view => view.playVideo()))
  }

  stopVideo (): Promise<void[]> {
    return Promise.all(this.viewsList.map(view => view.stopVideo()))
  }

  toggleVideo (): Promise<void[]> {
    return Promise.all(this.viewsList.map(view => view.toggleVideo()))
  }
  /**
   * END: Video controls
   */

  get isImageLoading (): boolean {
    return !!this.activeView.isImageLoading
  }

  public invalidateAnnotationCache (): void {
    this.viewsList.forEach(view => {
      view.invalidateAnnotationCache()
    })
  }

  public initializeAnnotation (
    params: Pick<CreateAnnotationParams, 'actors' | 'type' | 'data' | 'classId'>
  ): Annotation | null {
    return this.activeView.initializeAnnotation(params) || null
  }

  protected onCleanup: Function[] = []

  public cleanup (): void {
    this.layout.cleanup()
    this.pluginManager.cleanup()
    this.hotkeyManager.cleanup()
    this.onCleanup.forEach(callback => callback())
    window.cancelAnimationFrame(this.renderAnimationFrameID)
  }
}

export interface PluginContext {
  editor: Editor;
  handles: CallbackHandle[];

  /**
   * Register a Vue component to be used by the plugin to render custom UI elements.
   *
   * Vue doesn't really provide a way to unregister components,
   * so there is no associated `unregisterComponent` function.
   *
   * Rather, repeated registration of the same component doesn't do anything.
   */
  registerComponent: (name: string, component: any) => void

  registerTool(name: string, tool: Tool): void;
  unregisterTool(name: string): void;

  registerCommand(name: string, action: ((...args: any[]) => void)): void;
  unregisterCommand(name: string): void;

  registerAnnotationRenderer(name: string, renderer: AnnotationTypeRenderer): void;
  unregisterAnnotationRenderer(name: string): void;

  registerSerializer(name: string, serializer: AnnotationTypeSerializer): void;
  unregisterSerializer(name: string): void;

  registerAnnotationOverlayer(name: string, overlayer: AnnotationOverlayer): void;
  unregisterAnnotationOverlayer(name: string): void;

  registerMeasureOverlayer(name: string, overlayer: MeasureOverlayer): void;
  unregisterMeasureOverlayer(name: string): void;
}
