import { Store } from 'vuex'

import { IView, VideoSubAnnotationDataPayload } from '@/engine/models/views/types'
import { AnnotationClass } from '@/engineCommon/AnnotationClass'
import { AnnotationType } from '@/engineCommon/AnnotationType'
import { CallbackHandle } from '@/engineCommon/callbackHandler'
import { Camera } from '@/engineCommon/camera'
import { ImageManipulationFilter, WindowLevels } from '@/engineCommon/imageManipulation'
import { CanvasPoint, EditableImagePoint, ImagePoint } from '@/engineCommon/point'
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
  RootState,
  RunningSessionPayload
} from '@/store/types'

import ClassDialog from './ClassDialog'
import { EditorCursor } from './EditorCursor'
import {
  ActionManager,
  HotkeyManager,
  PluginConfig,
  PluginManager,
  SerializerManager,
  SubAnnotationToolPayload,
  ToolManager
} from './managers'
import { IAnnotationManager } from './managers/IAnnotationManager'
import {
  AnnotationData,
  CreateAnnotationParams,
  LoadedImageWithTiles,
  Layout,
  View,
  Annotation
} from './models'

export interface IEditor {
  readonly version: '1.0' | '2.0'

  layout: Layout

  init (embedded: boolean): void

  buildAnnotationManager (view: IView): IAnnotationManager

  actionManager: ActionManager
  hotkeyManager: HotkeyManager
  pluginManager: PluginManager
  serializerManager: SerializerManager
  toolManager: ToolManager
  classDialog: ClassDialog

  embedded: boolean

  store: Store<RootState>

  setupLayout (layout: LayoutConfig): void

  readonly views: { [key: string]: View }
  readonly viewsList: View[]
  readonly activeView: View

  /**
   * Installs plugins into plugin manager, and then links editor with the store.
   *
   * The two actions always need to be executed in that order, or we
   * get unexpected behavior, unnecessary re-renders or even errors.
   */
  installAllPlugins (plugins: PluginConfig[]): void

  readonly cameraScale: number
  readonly isResetZoom: boolean
  readonly camera: Camera

  disableEditSubAnnotations (): void
  disableAnnotationOverlays (): void
  enableAnnotationOverlays (): void

  readonly hasCurrentItem: boolean
  readonly currentItem: DatasetItemPayload | null

  loadedImage: LoadedImageWithTiles | null
  loadedVideo: LoadedVideo | null
  readonly renderingImage: RenderableImage | null

  readonly windowLevelsRange: WindowLevels | null
  readonly measureRegion: MeasureRegionsPayload | null

  renderHistogram (canvas: HTMLCanvasElement): void

  setImageFilter (filter: ImageManipulationFilter): void

  isFrameIndexValid (frameIndex: number): boolean

  jumpToFrame (frameIndex: number, resetZoom: boolean): void

  setItem (item: DatasetItemPayload | null): void

  initializeSubAnnotation (
    type: AnnotationTypeName,
    parent: Annotation,
    data: AnnotationData
  ): Annotation | null

  updateAnnotationData (annotation: Annotation, data: AnnotationData): void

  saveAnnotation (annotation: Annotation): void

  activateTool (name: string, payload?: { sub: SubAnnotationToolPayload }): void

  /**
   * Activate a ToolOption by ID.
   * If that ToolOption belongs to any category,
   * deactivate all the other ToolOptions in that category.
   *
   * @param toolOptionId the ID of the ToolOption to be activated
   */
  activateToolOption (toolOptionId: string): void
  deactivateToolOption (toolOptionId: string): void
  deactivateToolOptions (): void
  setToolOptionProps (name: string, props: object): void

  getMainAnnotationTypeForClass (aClass: AnnotationClass): AnnotationTypePayload

  /**
   * Delegate to a store getter which infers the sub annotation types of a class
   */
  getSubAnnotationTypesForClass (aClass: AnnotationClass): AnnotationType[]

  /**
   * Changes the class of the currently selected annotation, if allowed
   *
   * Class change can only happen if the new class is of the same main type as the old class
   */
  maybeChangeSelectedAnnotationClass (newClass: AnnotationClass): boolean

  /**
   * Automatically activates appropriate tool in the editor
   *
   * This happens upon tool selection from sidebar, or class selection from top
   * bar.
   */
  autoActivateTool (): void

  readonly autoAnnotateModels: RunningSessionPayload[]
  readonly preselectedAutoAnnotateModel: RunningSessionPayload | null
  readonly clickerEpsilon: number

  /**
   * Automatically preselects a neural model if one isn't already selected.
   *
   * If a model of type `ModelType.AutoAnnotation` exists, select that, otherwise
   * select the first model among the available ones.
   */
  setPreselectedAutoAnnotateModel (): void

  readonly preselectedModelClassMapping: ClassMapping

  findTopAnnotationAt (
    point: ImagePoint,
    filter?: (annotation: Annotation) => boolean
  ): Annotation | undefined

  isPointOnPath (point: ImagePoint, path: EditableImagePoint[]): boolean
  isPointOnPaths (point: ImagePoint, paths: EditableImagePoint[][]): boolean
  isPointInPath (point: ImagePoint, path: EditableImagePoint[]): boolean
  isPointInPath2D (path2D: Path2D, point: ImagePoint): boolean
  findVertexAtPath (
    paths: EditableImagePoint[][],
    point: ImagePoint,
    threshold?: number
  ): EditableImagePoint | undefined
  findAnnotationVertexAt (
    point: ImagePoint,
    threshold?: number
  ): EditableImagePoint | undefined

  hasAnnotation (annotation: Annotation): boolean
  unhighlightAllVerticesInPath (paths: EditableImagePoint[][]): void
  unhighlightAllAnnotationsVertices (): void
  unhighlightAllVertices (): void
  deselectAllVerticesInPath (paths: EditableImagePoint[][]): void
  unhighlightAllAnnotations (): void
  deselectAllAnnotations (): void
  deselectAllVertices (): void
  unhighlightAll (): void
  deselectAll (): void
  readonly selectedAnnotation: Annotation | undefined
  readonly selectedVertex: EditableImagePoint | undefined
  readonly visibleAnnotations: Annotation[]
  readonly mainAnnotations: Annotation[]
  readonly visibleMainAnnotations: Annotation[]
  readonly visibleNonTagAnnotations: Annotation[]
  readonly highlightedAnnotations: Annotation[]
  readonly highlightedVertices: EditableImagePoint[]

  toast (toast: Toast): void

  readonly selectedAnnotationVertices: EditableImagePoint[]

  selectPreviousVertex (): void
  selectNextVertex (): void
  selectPreviousAnnotation (): Annotation | null
  selectNextAnnotation (): Annotation | null
  zoomToAnnotation (annotation: Annotation): void
  moveSelectedAnnotation (offset: ImagePoint): void
  toggleAnnotations (): void
  toggleSubAnnotations (): void
  toggleMeasures (): void
  readonly showAnnotations: boolean
  readonly showSubAnnotations: boolean
  readonly showMeasures: boolean

  selectCursor (cursorClass: EditorCursor, text?: string, canvasPoint?: CanvasPoint): void

  resolveAnnotationType (
    stageAnnotation: StageAnnotation,
    view?: IView
  ): AnnotationTypeName | null

  registerCommand (name: string, action: ((...args: any[]) => void)): void
  unregisterCommand (name: string): void
  callCommand (name: string, ...args: any[]): void

  render (): void

  scaleToFit (): void
  activateCallbacks (): void
  deactivateCallbacks (): void

  // Callbacks
  onModelsChanged (cb: (models: RunningSessionPayload[]) => void): CallbackHandle[]
  onDoubleClick (cb: (event: MouseEvent) => void): CallbackHandle[]
  onMouseDown (cb: (event: MouseEvent) => void): CallbackHandle[]
  onMouseUp (cb: (event: MouseEvent) => void): CallbackHandle[]
  onMouseMove (cb: (event: MouseEvent) => void): CallbackHandle[]
  onMouseLeave (cb: (event: MouseEvent) => void): CallbackHandle[]
  onGestureStart (cb: (event: Event) => void): CallbackHandle[]
  onGestureChange (cb: (event: Event) => void): CallbackHandle[]
  onGestureEnd (cb: (event: Event) => void): CallbackHandle[]
  onWheel (cb: (event: WheelEvent) => void): CallbackHandle[]
  onTouchStart (cb: (event: TouchEvent) => void): CallbackHandle[]
  onTouchEnd (cb: (event: TouchEvent) => void): CallbackHandle[]
  onTouchMove (cb: (event: TouchEvent) => void): CallbackHandle[]
  onKeyDown (cb: (event: KeyboardEvent) => void): CallbackHandle[]
  onKeyPress (cb: (event: KeyboardEvent) => void): CallbackHandle[]
  onKeyUp (cb: (event: KeyboardEvent) => void): CallbackHandle[]

  addComponent (params: { id: string, name: string, props: any }): void
  removeComponent (id: string): void

  inferVideoSubAnnotations (annotation: Annotation): Annotation[]
  getVideoSubAnnotationData (annotation: Annotation): VideoSubAnnotationDataPayload
  inferVideoAnnotationDataOnly (
    annotationData: AnnotationData,
    annotationType: string
  ): AnnotationData
  inferVideoSubAnnotationDataOnly (annotationData: AnnotationData): AnnotationData

  preselectedAnnotationClassColor (alpha: number): string
  selectedAnnotationClassColor (alpha: number): string

  /**
   * START: Video controls
   */
  readonly isPlaying: boolean
  playVideo (): Promise<void[]>
  stopVideo (): Promise<void[]>
  toggleVideo (): Promise<void[]>
  /**
   * END: Video controls
   */

  readonly isImageLoading: boolean

  invalidateAnnotationCache (): void
  initializeAnnotation (
    params: Pick<CreateAnnotationParams, 'actors' | 'type' | 'data' | 'classId'>
  ): Annotation | null

  cleanup (): void
}
