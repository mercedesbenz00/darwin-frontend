import { Store } from 'vuex'

import { Editor } from '@/engine/editor'
import { InterpolationAlgorithm } from '@/engine/interpolate'
import {
  ActionGroup,
  ActionManager,
  CommentManager,
  OverlayManager,
  RenderManager,
  ToolManager,
  MeasureManager
} from '@/engine/managers'
import { IAnnotationManager } from '@/engine/managers/IAnnotationManager'
import {
  Annotation,
  AnnotationData,
  CreateAnnotationParams,
  ImageAnnotation,
  Layer,
  HTMLLayer,
  LoadedImageWithTiles,
  VideoAnnotation,
  VideoSubAnnotations
} from '@/engine/models'
import { ILayer } from '@/engine/models/layers/types'
import { AnnotationClass } from '@/engineCommon/AnnotationClass'
import { AnnotationType } from '@/engineCommon/AnnotationType'
import {
  AutoAnnotateInferencePayload,
  InferenceData,
  InferenceResult
} from '@/engineCommon/backend'
import { CallbackHandle, CallbackHandleCollection } from '@/engineCommon/callbackHandler'
import { Camera } from '@/engineCommon/camera'
import { ImageManipulationFilter, WindowLevels } from '@/engineCommon/imageManipulation'
import { EditableImagePoint, ImagePoint, Point } from '@/engineCommon/point'
import { CommentThread } from '@/store/modules/comment/types'
import { LoadedFrame, LoadedVideo, RenderableImage } from '@/store/modules/workview/types'
import {
  AnnotationTypePayload,
  AnnotationClassPayload,
  AnnotationTypeName,
  DatasetItemPayload,
  DatasetVideoLayout,
  DatasetVideoMetadata,
  MeasureRegionsPayload,
  RootState,
  RunningSessionPayload,
  TrainedModelPayload
} from '@/store/types'

type FunctionListener = (event: any) => void
type ObjectListener = {
  listener: (event: any) => void
  options: { passive: boolean }
}
type ListenerDefinition = FunctionListener | ObjectListener

export class EditorError extends Error {
  constructor (message: string) {
    super(`Editor: ${message}`)
  }
}

export type VideoAnnotationDataPayload = {
  data: AnnotationData
  subs: Annotation[]
  keyframe: boolean
  subkeyframe: boolean
  interpolateAlgorithm: InterpolationAlgorithm
}

export type VideoSubAnnotationDataPayload = {
  subs: Annotation[]
  subkeyframe: boolean
}

export type ViewManagers = {
  toolManager: ToolManager
  actionManager: ActionManager
}

export type OriginBasedFrameIndex = number
export type ZeroBasedFrameIndex = number

export interface IView {
  id: string

  editor: Editor

  store: Store<RootState>

  isPlaying: boolean
  mainLayer: Layer
  annotationsLayer: Layer
  annotationsOverlayLayer: HTMLLayer
  imageFilter: ImageManipulationFilter
  camera: Camera
  inferenceData: Annotation[]
  annotationClasses: AnnotationClass[]
  measureManager: MeasureManager
  annotationManager: IAnnotationManager
  toolManager: ToolManager
  overlayManager: OverlayManager
  commentManager: CommentManager
  actionManager: ActionManager
  renderManager: RenderManager
  subAnnotationsTypesForClasses: Map<number, AnnotationType[]>
  rawImage: HTMLImageElement | null
  loadingItem: DatasetItemPayload | null

  readonly width: number
  readonly height: number

  readonly layers: ILayer[]

  readonly canvasContainer: DocumentFragment

  readonly isActive: boolean

  showPills: boolean
  loadedImage: LoadedImageWithTiles | null
  loadedVideo: LoadedVideo | null
  readonly renderingImage: RenderableImage | null
  readonly hasCurrentItem: boolean
  currentItem: DatasetItemPayload | null

  readonly commentThread: CommentThread | null
  readonly commentThreads: CommentThread[]

  setCommentThreads (): void

  readonly storeCommentThreads: CommentThread[]
  readonly windowLevelsRange: WindowLevels
  readonly defaultWindowLevels: WindowLevels
  readonly renderingImageData: ImageData | null
  readonly videoMetadata: DatasetVideoMetadata | null
  readonly measureRegion: MeasureRegionsPayload | null
  readonly annotations: Annotation[]
  readonly selectedAnnotation: Annotation | undefined
  readonly isDicomItem: boolean
  readonly isPdfItem: boolean
  readonly defaultImageSmoothing: boolean
  readonly mainAnnotations: Annotation[]
  readonly visibleAnnotations: Annotation[]
  readonly visibleMainAnnotations: Annotation[]
  readonly visibleNonTagAnnotations: Annotation[]
  readonly highlightedAnnotations: Annotation[]
  readonly highlightedVertices: EditableImagePoint[]
  readonly frames: { [key: number]: LoadedFrame }
  readonly zeroBasedFrames: { [key: number]: LoadedFrame }
  readonly itemLayout: DatasetVideoLayout | null
  readonly itemGroup: number[] | null
  readonly framesIndexes: OriginBasedFrameIndex[]
  readonly zeroBasedFramesIndexes: ZeroBasedFrameIndex[]
  readonly firstFrameIndex: OriginBasedFrameIndex
  readonly lastFrameIndex: OriginBasedFrameIndex

  currentFrameIndex: OriginBasedFrameIndex

  zeroBasedCurrentFrameIndex: ZeroBasedFrameIndex

  readonly hasAllGroupsWithOneFrame: boolean
  readonly isOneFrameView: boolean

  toZeroBasedIndex (index: OriginBasedFrameIndex): ZeroBasedFrameIndex
  toOriginBasedIndex (index: ZeroBasedFrameIndex): OriginBasedFrameIndex
  updateCameraDimensions (width?: number, height?: number): void
  isVideoAnnotationAtPoint (annotation: VideoAnnotation, point: ImagePoint): boolean
  isImageAnnotationAtPoint (annotation: ImageAnnotation, point: ImagePoint): boolean
  setAnnotations (): void
  isPointOnPath (point: ImagePoint, path: EditableImagePoint[]): boolean
  isPointOnPaths (point: ImagePoint, paths: EditableImagePoint[][]): boolean
  isPointInPath (point: ImagePoint, path: EditableImagePoint[]): boolean
  isPointInPath2D (path2D: Path2D, point: ImagePoint): boolean
  findVertexAtPath (
    paths: EditableImagePoint[][],
    point: ImagePoint,
    threshold?: number
  ): EditableImagePoint | undefined
  selectPreviousAnnotation (): void
  selectNextAnnotation (): void
  allLayersChanged (): void
  zoomTo (topLeft: Point<'Image'>, bottomRight: Point<'Image'>): void
  moveSelectedAnnotation (offset: ImagePoint): void
  performMoveAction (): Promise<void>
  inferVideoSubAnnotations (annotation: Annotation): Annotation[]
  getVideoSubAnnotationData (annotation: Annotation): VideoSubAnnotationDataPayload
  inferVideoAnnotationDataOnly (
    annotationData: AnnotationData,
    annotationType: string
  ): AnnotationData
  inferVideoSubAnnotationDataOnly (annotationData: AnnotationData): AnnotationData
  preselectedAnnotationClassColor (alpha: number): string
  selectedAnnotationClassColor (alpha: number): string
  setRawImage (base64: string): Promise<void>
  loadFrame (index: number): Promise<void>
  setAnnotationClasses (classes: AnnotationClassPayload[]): void
  addAnnotationClass (annotationClass: AnnotationClass): void
  addSubAnnotationTypesForClass (annotationClass: AnnotationClass): void
  invalidateAnnotationCache (): void
  renderHistogram (canvas: HTMLCanvasElement): void
  clearHistogram (canvas: HTMLCanvasElement): void
  drawHistogram (
    canvas: HTMLCanvasElement,
    imageData: ImageData,
    metadata: DatasetVideoMetadata | null
  ): void
  readonly totalItemsFrames: number
  readonly totalFrames: number
  isFrameIndexValid (frameIndex: number): boolean
  isFrameIndexRelatedToView (index: number): boolean
  readonly selectedVertex: any
  readonly preselectedAnnotationClass: AnnotationClass | null
  readonly tagAnnotationClasses: AnnotationClass[]
  readonly nonTagAnnotations: (Annotation & { annotationClass: AnnotationClass })[]
  getMainAnnotationTypeForClass (aClass: AnnotationClass): AnnotationTypePayload
  getSubAnnotationTypesForClass (aClass: AnnotationClass): AnnotationType[]
  maybeChangeSelectedAnnotationClass (newClass: AnnotationClass): boolean
  autoSelectClass (): void
  resolveAnnotationClass (typeName: AnnotationTypeName): Promise<AnnotationClass | null>
  prepareAnnotationForCreation (
    params: Pick<
      CreateAnnotationParams,
      'id' | 'classId' | 'type' | 'data' | 'isSelected'
    >,
    subAnnotationParams?: any
  ): Promise<Annotation | void>
  initializeSubAnnotation (
    type: AnnotationTypeName,
    parent: Annotation,
    data: AnnotationData
  ): Annotation | null
  updateAnnotationData (annotation: Annotation, data: AnnotationData): void
  updateAnnotationSubs (annotation: Annotation, videoSubs: VideoSubAnnotations): void
  updateAnnotationFrame (
    annotation: Annotation,
    frame: AnnotationData,
    subs: Annotation[],
    index: number
  ): void
  readonly isVersion2: boolean
  readonly selectedAnnotationVertices: EditableImagePoint[]
  selectPreviousVertex (): void
  selectNextVertex (): void
  createAnnotation (
    params: Pick<
      CreateAnnotationParams,
      'id' | 'classId' | 'type' | 'data' | 'isSelected'
    >,
    actionGroup?: ActionGroup,
    subAnnotationParams?: any
  ): Promise<Annotation | void>
  createAnnotations (
    paramsList: Pick<
      CreateAnnotationParams,
      'id' | 'classId' | 'type' | 'data' | 'isSelected'
    >[],
    actionGroup?: ActionGroup,
    subAnnotationParamsList?: any[]
  ): Promise<Annotation[] | undefined>
  removeAnnotation (payload: { id: string }, actionGroup?: ActionGroup): Promise<void>
  setItem (item: DatasetItemPayload | null, framesGroup: number[] | null): Promise<void>
  readonly isResetZoom: boolean
  readonly mainAnnotationTypes: AnnotationTypeName[]
  readonly subAnnotationTypes: AnnotationTypeName[]
  readonly annotationTypes: Map<AnnotationTypeName, AnnotationTypeName[]>
  jumpToFrame (frameIndex: number, resetZoom: boolean): Promise<void>
  scaleToFit (): void
  setImageFilter (filter: ImageManipulationFilter): void
  render (): void
  setInferenceData (
    results: InferenceResult[],
    classes: TrainedModelPayload['classes']
  ): void
  runInference (runningSessionId: string, data: InferenceData | AutoAnnotateInferencePayload): void
  playVideo (): void
  stopVideo (): void
  toggleVideo (): void
  readonly isImageLoading: boolean
  createKeyFrame (annotation: Annotation | null, frameIndex: number): void
  deleteKeyFrame (annotation: Annotation | null, key: number | null): void
  readonly canForceRenderSubAnnotations: boolean
  findTopAnnotationAt (
    point: ImagePoint,
    filter?: (annotation: Annotation) => boolean
  ): Annotation | undefined
  initializeAnnotation (
    params: Pick<CreateAnnotationParams, 'actors' | 'id' | 'type' | 'data' | 'classId'>
  ): Annotation | null
  readonly cameraScale: number
  disableAnnotationOverlays (): void
  enableAnnotationOverlays (): void
  components: { id: string, name: string, props: any }[]
  addComponent (params: { id: string, name: string, props: any }): void
  removeComponent (id: string): void
  findAnnotationVertexAt (
    point: ImagePoint,
    threshold?: number
  ): EditableImagePoint | undefined
  hasAnnotation (annotation: Annotation): boolean
  unhighlightAllVerticesInPath (paths: EditableImagePoint[][]): void
  unhighlightAllAnnotationsVertices (): void
  unhighlightAllVertices (): void
  deselectAllVerticesInPath (paths: EditableImagePoint[][]): void
  deselectAllAnnotationsVertices (): void
  deselectAllVertices (): void
  unhighlightAll (): void
  deselectAll (): void
  unhighlightAllAnnotations (): void
  deselectAllAnnotations (): void
  onModelsChangedCallbacks: CallbackHandleCollection<[RunningSessionPayload[]]>
  onOnKeyDownCallbacks: CallbackHandleCollection<[KeyboardEvent]>
  onOnKeyPressCallbacks: CallbackHandleCollection<[KeyboardEvent]>
  onOnKeyUpCallbacks: CallbackHandleCollection<[KeyboardEvent]>
  activateCallbacks (): void
  deactivateCallbacks (): void
  onModelsChanged (cb: (models: RunningSessionPayload[]) => void): CallbackHandle
  onDoubleClick (cb: (event: MouseEvent) => void): CallbackHandle
  onMouseDown (cb: (event: MouseEvent) => void): CallbackHandle
  onMouseUp (cb: (event: MouseEvent) => void): CallbackHandle
  onMouseMove (cb: (event: MouseEvent) => void): CallbackHandle
  onMouseLeave (cb: (event: MouseEvent) => void): CallbackHandle
  onGestureStart (cb: (event: Event) => void): CallbackHandle
  onGestureChange (cb: (event: Event) => void): CallbackHandle
  onGestureEnd (cb: (event: Event) => void): CallbackHandle
  onWheel (cb: (event: WheelEvent) => void): CallbackHandle
  onTouchStart (cb: (event: TouchEvent) => void): CallbackHandle
  onTouchEnd (cb: (event: TouchEvent) => void): CallbackHandle
  onTouchMove (cb: (event: TouchEvent) => void): CallbackHandle
  onKeyDown (cb: (event: KeyboardEvent) => void): CallbackHandle
  onKeyPress (cb: (event: KeyboardEvent) => void): CallbackHandle
  onKeyUp (cb: (event: KeyboardEvent) => void): CallbackHandle
  canvasListeners: { [s: string]: ListenerDefinition }
  readonly permanentListenersKeys: string[]
  addListeners (): void
  removeListeners (includePermanent?: boolean): void
  cleanup (): void
  isInViewport (annotation: Annotation): boolean
  onFrameLoaded (cb: (frameIndex: number) => void): CallbackHandle
}
