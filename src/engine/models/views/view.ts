import { clamp, cloneDeep } from 'lodash'
import { v4 as uuidv4 } from 'uuid'
import Vue from 'vue'
import { Store } from 'vuex'

import {
  addAnnotationAction,
  addAnnotationsAction,
  changeAnnotationClass,
  createKeyframeAction,
  deleteAnnotationAction,
  deleteKeyframeAction,
  updateAnnotationData
} from '@/engine/actions'
import { Editor } from '@/engine/editor'
import { LinearInterpolationParams } from '@/engine/interpolate'
import {
  ActionGroup,
  ActionManager,
  CommentManager,
  OverlayManager,
  RenderManager,
  ToolManager,
  isMainAnnotationTypeRenderer,
  supportsInterpolation,
  MeasureManager,
  belongsToItem
} from '@/engine/managers'
import { IAnnotationManager } from '@/engine/managers/IAnnotationManager'
import {
  Annotation,
  AnnotationData,
  CreateAnnotationParams,
  ImageAnnotation,
  ImageSubAnnotation,
  Layer,
  HTMLLayer,
  LoadedImageWithTiles,
  VideoAnnotation,
  VideoAnnotationData,
  VideoSubAnnotations,
  buildInitialSegments,
  isVideoSubAnnotations
} from '@/engine/models'
import { ILayer } from '@/engine/models/layers/types'
import {
  IView,
  OriginBasedFrameIndex,
  VideoSubAnnotationDataPayload,
  ViewManagers,
  ZeroBasedFrameIndex
} from '@/engine/models/views/types'
import { isPreselectedModelAutoAnnotate } from '@/engine/plugins/click/utils'
import { translatePath, translateVertex } from '@/engine/plugins/edit/utils'
import { STRING_ANNOTATION_TYPE } from '@/engine/plugins/field/types'
import { LINK_ANNOTATION_TYPE } from '@/engine/plugins/link/types'
import { getLinkAnnotationData } from '@/engine/plugins/link/utils'
import { getEdgesAsPaths, isSkeleton } from '@/engine/plugins/skeleton'
import {
  calcCentroidPoint,
  generateHistogramData,
  getWindowLevelsRange,
  loadHqFrame,
  loadImageData,
  loadImageFromUrl,
  loadLqFrame,
  resolveRawImageData,
  BBox,
  getCSSFilterString
} from '@/engine/utils'
import { AnnotationClass } from '@/engineCommon/AnnotationClass'
import { AnnotationType } from '@/engineCommon/AnnotationType'
import { euclideanDistance } from '@/engineCommon/algebra'
import {
  AutoAnnotateInferencePayload,
  InferenceData,
  InferenceResult,
  isClickerData
} from '@/engineCommon/backend'
import { CallbackHandle, CallbackHandleCollection } from '@/engineCommon/callbackHandler'
import { Camera } from '@/engineCommon/camera'
import {
  DEFAULT_IMAGE_MANIPULATION_FILTER,
  ImageManipulationFilter,
  WindowLevels
} from '@/engineCommon/imageManipulation'
import {
  EditableImagePoint,
  ImagePoint,
  pointInPath,
  pointIsVertexOfPath,
  pointOnPath,
  Point
} from '@/engineCommon/point'
import { CommentThread } from '@/store/modules/comment/types'
import runInference from '@/store/modules/workview/actions/runInference'
import {
  LoadedFrame,
  LoadedVideo,
  RenderableImage,
  StageAnnotation
} from '@/store/modules/workview/types'
import { compareByZIndexCamelcase } from '@/store/modules/workview/utils'
import {
  AnnotationActorPayload,
  AnnotationTypeName,
  AnnotationTypePayload,
  DatasetItemPayload,
  DatasetVideoLayout,
  DatasetVideoMetadata,
  MeasureRegionsPayload,
  RESET_ZOOM_MODE,
  RootState,
  RunningSessionPayload,
  StoreActionPayload,
  StoreActionResponse,
  TrainedModelPayload
} from '@/store/types'
import { AnnotationClassPayload } from '@/store/types/AnnotationClassPayload'
import {
  getFileExtension,
  getPreviousFrameIndex,
  rgbaString
} from '@/utils'
import { CanvasEvent } from '@/utils/touch'

type FunctionListener = (event: any) => void
type ObjectListener = {
  listener: (event: any) => void
  options: { passive: boolean }
}
type ListenerDefinition = FunctionListener | ObjectListener

const addListener = (
  context: Window | Document | HTMLElement,
  [key, value]: [string, ListenerDefinition]
): void => {
  if ('options' in value) {
    const definition = value as ObjectListener
    context.addEventListener(key, definition.listener, definition.options)
  } else {
    const definition = value as FunctionListener
    context.addEventListener(key, definition)
  }
}

const removeListener = (
  context: Window | Document | HTMLElement,
  [key, value]: [string, ListenerDefinition]
): void => {
  if ('options' in value) {
    const definition = value as ObjectListener
    context.removeEventListener(key, definition.listener)
  } else {
    const definition = value as FunctionListener
    context.removeEventListener(key, definition)
  }
}

export class EditorError extends Error {
  constructor (message: string) {
    super(`Editor: ${message}`)
  }
}

export class View implements IView {
  public id: string
  private annotationMoving: Annotation | undefined
  private initialAnnotationData: AnnotationData | undefined

  public isPlaying = false
  protected videoInterval: any

  protected static RERENDER_LIMIT = 50

  /**
   * Main layer - renders image/video on the screen.
   *
   * Only zoom, panning, and image filter update
   * will trigger its re-render.
   */
  public mainLayer: Layer
  /**
   * Annotations layer - renders annotations, comments, inferenceData items.
   */
  public annotationsLayer: Layer
  /**
   * Annotations overlays layer - renders overlays related to annotations.
   */
  public annotationsOverlayLayer: HTMLLayer

  public imageFilter: ImageManipulationFilter = DEFAULT_IMAGE_MANIPULATION_FILTER

  protected pendingFrames: Map<number, LoadedFrame> = new Map()

  public camera = new Camera()

  /**
   * Keeps annotations for Editor embedded mode
   */
  public inferenceData: Annotation[] = []
  public annotationClasses: AnnotationClass[] = []

  public measureManager: MeasureManager
  public annotationManager: IAnnotationManager
  public toolManager: ToolManager
  public overlayManager: OverlayManager
  public commentManager: CommentManager
  public actionManager: ActionManager
  public renderManager = new RenderManager()

  public subAnnotationsTypesForClasses = new Map<number, AnnotationType[]>();
  public rawImage: HTMLImageElement | null = null
  protected framesGroup: number[] | null = null
  private _currentItem: DatasetItemPayload | null = null
  private _loadedImage: LoadedImageWithTiles | null = null
  protected _loadedVideo: LoadedVideo | null = null

  /**
   * Stores handle for window.requestAnnimationFrame callback
   *
   * Allows the reuqest to be cancelled if a new one is pending
   */
  protected repaintHandle: number | null = null

  /**
   * Currently loading dataset item
   * We need to keep this to avoid reloading the image/video again
   */
  loadingItem: DatasetItemPayload | null = null

  private _showPills: boolean = true

  protected onCleanup: Function[] = []

  constructor (
    public editor: Editor,
    public store: Store<RootState>,
    managers: ViewManagers
  ) {
    this.id = uuidv4()

    this.mainLayer = new Layer()
    this.annotationsLayer = new Layer()
    this.annotationsOverlayLayer = new HTMLLayer()

    this.editor = editor
    this.store = store

    this.toolManager = managers.toolManager
    this.actionManager = managers.actionManager

    this.measureManager = new MeasureManager(this)
    this.annotationManager = this.editor.buildAnnotationManager(this)
    this.overlayManager = new OverlayManager(this)
    this.commentManager = new CommentManager(this)

    this.addPermanentListeners()

    this.onCleanup.push(
      this.mainLayer.onBeforeRender((ctx, canvas) => this.onBeforeRender(canvas))
        .release
    )
    this.onCleanup.push(
      this.annotationsLayer.onBeforeRender((ctx, canvas) => this.onBeforeRender(canvas))
        .release
    )

    this.onCleanup.push(
      this.mainLayer.onRender(() => this.onRender())
        .release
    )
    this.onCleanup.push(
      this.annotationsLayer.onRender(() => this.onRender())
        .release
    )

    this.onCleanup.push(
      this.annotationManager.onAnnotationsChange(() => {
        // Redefine Views annotations items
        this.setAnnotations()
        this.overlayManager.reset()
        this.measureManager.reset()
        this.annotationsLayer.changed()
      })
        .release
    )
  }

  private onBeforeRender (canvas: HTMLCanvasElement): void {
    canvas.width = this.camera.width
    canvas.height = this.camera.height
  }

  private onRender (): void {
    this.renderManager.emitRenderCallbacks(this)

    this.annotationsOverlayLayer.changed()
  }

  get width (): number {
    return this.mainLayer.canvas.width
  }

  get height (): number {
    return this.mainLayer.canvas.height
  }

  get layers (): ILayer[] {
    return [
      this.mainLayer,
      this.annotationsLayer,
      this.annotationsOverlayLayer
    ]
  }

  get canvasContainer (): DocumentFragment {
    const documentFragment = document.createDocumentFragment()
    this.layers.forEach((layer) => {
      documentFragment.appendChild(layer.canvas)
    })

    return documentFragment
  }

  get isActive (): boolean {
    return this === this.editor.activeView
  }

  get showPills (): boolean {
    return this._showPills
  }

  set showPills (value: boolean) {
    Vue.set(this, '_showPills', value)
  }

  get loadedImage (): LoadedImageWithTiles | null {
    return this._loadedImage
  }

  set loadedImage (value: LoadedImageWithTiles | null) {
    this._loadedImage = value
  }

  get loadedVideo (): LoadedVideo | null {
    return this._loadedVideo
  }

  set loadedVideo (value: LoadedVideo | null) {
    this._loadedVideo = value
  }

  get renderingImage (): RenderableImage | null {
    const { loadedImage, loadedVideo } = this
    if (loadedImage) {
      return loadedImage.data
    } else if (loadedVideo) {
      if (!this.frames[this.currentFrameIndex]) {
        return null
      }

      const { lqData, hqData } = this.frames[this.currentFrameIndex]
      if (hqData) {
        return hqData
      } else if (lqData) {
        return lqData
      }
    }
    return null
  }

  public get hasCurrentItem (): boolean {
    return !!this.currentItem
  }

  get currentItem (): DatasetItemPayload | null {
    return this._currentItem
  }

  set currentItem (value: DatasetItemPayload | null) {
    this._currentItem = value
  }

  get commentThread (): CommentThread | null {
    const commentThread = this.store.getters['comment/currentCommentThread']

    if (!commentThread) { return null }

    if (this.loadedVideo) {
      if (typeof commentThread.frameIndex !== 'number') { return null }
      if (!this.isFrameIndexRelatedToView(commentThread.frameIndex)) {
        return null
      }
    }

    return commentThread
  }

  get commentThreads (): CommentThread[] {
    return this.commentManager.commentThreads
  }

  public setCommentThreads (): void {
    this.annotationsLayer.add({
      id: 'thread_layer',
      render: () => {
        this.commentThreads.forEach(thread => {
          // It renders comment thread box
          // That is visible on mouseover
          this.renderManager.renderComment(this, thread)
        })
      }
    })
  }

  get storeCommentThreads (): CommentThread[] {
    if (this.loadedVideo) {
      return this.commentManager.storeCommentThreads.filter(comment => {
        if (typeof comment.frameIndex !== 'number') { return false }

        return this.isFrameIndexRelatedToView(comment.frameIndex)
      })
    }

    return this.commentManager.storeCommentThreads
  }

  /**
   * Max/Min Window levels range of the current loaded image and video
   */
  get windowLevelsRange (): WindowLevels {
    const { loadedVideo, videoMetadata } = this

    if (loadedVideo) {
      return getWindowLevelsRange(videoMetadata?.colorspace)
    }

    return getWindowLevelsRange()
  }

  /**
   * Default window levels value of the current loaded image and video
   */
  get defaultWindowLevels (): WindowLevels {
    const { loadedVideo, videoMetadata } = this

    if (loadedVideo) {
      return getWindowLevelsRange(
        videoMetadata?.colorspace,
        videoMetadata?.default_window
      )
    }

    return getWindowLevelsRange()
  }

  get renderingImageData (): ImageData | null {
    const { renderingImage } = this
    if (!renderingImage) { return null }
    return resolveRawImageData(renderingImage)
  }

  get videoMetadata (): DatasetVideoMetadata | null {
    if (!this.currentItem) { return null }
    if (!this.currentItem.dataset_video) { return null }
    return this.currentItem.dataset_video.metadata
  }

  /**
   * Returns measure region with high priority
   * - When there is no measure region, use the image/video size
   * - When there are multiple regions, choose the one with high priority
   *   NOTE:
   *     It is possible that there can be several which has `high_priority` flag as true,
   *     In that case, we choose the first visible one.
   * - When there is only one region, choose the first one.
   */
  get measureRegion (): MeasureRegionsPayload | null {
    const { currentItem, videoMetadata } = this
    if (!currentItem) { return null }

    if (currentItem.dataset_video) {
      if (
        videoMetadata &&
        videoMetadata.measure_regions &&
        videoMetadata.measure_regions.length > 0
      ) {
        const measureRegions = videoMetadata.measure_regions
        const highPriorityOne = measureRegions.find(mr => mr.high_priority)
        return highPriorityOne || measureRegions[0]
      }

      return {
        delta: { x: 1, y: 1 },
        high_priority: true,
        unit: { x: 'px', y: 'px' },
        x: 0,
        y: 0,
        w: currentItem.dataset_video.width,
        h: currentItem.dataset_video.height
      }
    }

    if (currentItem.dataset_image) {
      return {
        delta: { x: 1, y: 1 },
        high_priority: true,
        unit: { x: 'px', y: 'px' },
        x: 0,
        y: 0,
        w: currentItem.dataset_image.image.width,
        h: currentItem.dataset_image.image.height
      }
    }

    return null
  }

  /**
   * Annotations for this view only
   */
  get annotations (): Annotation[] {
    return this.annotationManager.annotations
  }

  get viewsAnnotations (): Annotation[] {
    return this.annotationManager.viewsAnnotations
  }

  get selectedAnnotation (): Annotation | undefined {
    return this.annotations.find(annotation => annotation.isSelected)
  }

  get isDicomItem (): boolean {
    const { videoMetadata } = this
    return !!videoMetadata && videoMetadata.type === 'dicom'
  }

  get isPdfItem (): boolean {
    const { videoMetadata } = this
    return !!videoMetadata && videoMetadata.type === 'pdf'
  }

  get defaultImageSmoothing (): boolean {
    if (!this.currentItem?.filename) { return false }

    const { filename } = this.currentItem
    const fileExtension = getFileExtension(filename)
    const userValue = window.localStorage.getItem(`isImageSmoothing:${fileExtension}`)
    if (userValue) {
      return userValue === 'on'
    }

    return ['dcm', 'dicom', 'svs', 'pdf', 'tiff'].includes(fileExtension)
  }

  get mainAnnotations (): Annotation[] {
    return this.annotations.filter(annotation => annotation.parentId === undefined)
  }

  get visibleAnnotations (): Annotation[] {
    const { annotations, camera } = this
    const { currentTool } = this.toolManager

    const visibleAnnotations = annotations.filter(annotation => {
      if (!annotation.isVisible) { return false }

      if (annotation.type === STRING_ANNOTATION_TYPE) { return false }

      if (annotation.type !== LINK_ANNOTATION_TYPE) { return true }

      const { from, to } = getLinkAnnotationData(annotation, this)

      if (!from || !to) { return false }

      const fromAnnotation = this.annotationManager.getAnnotation(from)
      const toAnnotation = this.annotationManager.getAnnotation(to)

      if (!fromAnnotation || !toAnnotation) { return false }

      let { centroid: fromCentroid } = fromAnnotation
      let { centroid: toCentroid } = toAnnotation

      if (!fromCentroid) {
        const tempCentroid = calcCentroidPoint(this, fromAnnotation)
        if (!tempCentroid) { return false }
        fromCentroid = camera.canvasViewToImageView(tempCentroid)
      }

      if (!toCentroid) {
        const tempCentroid = calcCentroidPoint(this, toAnnotation)
        if (!tempCentroid) { return false }
        toCentroid = camera.canvasViewToImageView(tempCentroid)
      }

      return true
    })

    return currentTool && currentTool.tool.shouldRender
      ? visibleAnnotations.filter(annotation =>
        annotation.isVisible && currentTool.tool.shouldRender!(annotation)
      )
      : visibleAnnotations.filter(annotation => annotation.isVisible)
  }

  get visibleMainAnnotations (): Annotation[] {
    return this.visibleAnnotations.filter(annotation => annotation.parentId === undefined)
  }

  get visibleNonTagAnnotations (): Annotation[] {
    const tagClassIds = this.tagAnnotationClasses.map(a => a.id)
    return this.visibleMainAnnotations.filter((a) =>
      a.isVisible && !tagClassIds.includes(a.classId)
    )
  }

  get highlightedAnnotations (): Annotation[] {
    return this.visibleMainAnnotations.filter(annotation => annotation.isHighlighted)
  }

  get highlightedVertices (): EditableImagePoint[] {
    let vertices: EditableImagePoint[] = []
    for (const annotation of this.highlightedAnnotations) {
      const renderer = this.renderManager.rendererFor(annotation.type)
      if (!renderer || !('getAllVertices' in renderer)) { continue }

      if (!annotation.isVideoAnnotation()) {
        vertices = [
          ...vertices,
          ...renderer.getAllVertices(annotation, this).filter(v => v.isHighlighted)
        ]
        continue
      }

      const { data: annotationData } = annotation.inferVideoData(this)
      if (Object.keys(annotationData).length === 0) { continue }
      const actualAnnotation: Annotation = annotation.shallowClone({ data: annotationData })
      vertices = [
        ...vertices,
        ...renderer.getAllVertices(actualAnnotation, this).filter(v => v.isHighlighted)
      ]
    }
    return vertices
  }

  get frames (): { [key: number]: LoadedFrame } {
    const res: { [key: number]: LoadedFrame } = {}
    this.framesIndexes.forEach(i => {
      if (!this.loadedVideo) { return }

      res[i] = this.loadedVideo.frames[i]
    })

    return res
  }

  get zeroBasedFrames (): { [key: number]: LoadedFrame } {
    const res: { [key: number]: LoadedFrame } = {}

    Object.values(this.frames).forEach((frame, index) => {
      res[index] = frame
    })

    return res
  }

  get itemLayout (): DatasetVideoLayout | null {
    if (this.videoMetadata?.layout) {
      return {
        ...this.videoMetadata?.layout,
        groups: [...this.videoMetadata?.layout.groups]
      }
    }

    return null
  }

  get itemGroup (): number[] | null {
    const group = this.framesGroup

    if (group) {
      return [...group].sort((a, b) => a - b)
    }

    return null
  }

  get framesIndexes (): OriginBasedFrameIndex[] {
    // DICOM layout related
    if (this.itemGroup) { return this.itemGroup }

    // Video related
    if (!this.loadedVideo) { return [] }
    return Object.keys(this.loadedVideo.frames).map((index: string) => +index)
  }

  get zeroBasedFramesIndexes (): ZeroBasedFrameIndex[] {
    return this.framesIndexes.map(f => this.toZeroBasedIndex(f))
  }

  get firstFrameIndex (): OriginBasedFrameIndex {
    return this.framesIndexes[0] || 0
  }

  get lastFrameIndex (): OriginBasedFrameIndex {
    return this.framesIndexes[this.framesIndexes.length - 1] || 0
  }

  get currentFrameIndex (): OriginBasedFrameIndex {
    if (!this.loadedVideo) { return 0 }

    const { currentFrameIndex } = this.loadedVideo

    return currentFrameIndex
  }

  set currentFrameIndex (value: OriginBasedFrameIndex) {
    if (!this.loadedVideo) { return }
    if (!Number.isFinite(value)) { return }

    this.commentManager.deselectAllCommentThreads()

    this.loadedVideo.currentFrameIndex = value
  }

  get zeroBasedCurrentFrameIndex (): ZeroBasedFrameIndex {
    if (!this.loadedVideo) { return 0 }

    return this.toZeroBasedIndex(this.currentFrameIndex)
  }

  set zeroBasedCurrentFrameIndex (value: ZeroBasedFrameIndex) {
    if (!this.loadedVideo) { return }
    if (!this.framesIndexes.length) { return }

    this.currentFrameIndex = value + this.firstFrameIndex
  }

  /**
   * Hide video control if loadedVideo is dicom with split-screen
   * (DICOM split-screen can have more than one frame but it will show it in a separate section)
   */
  get hasAllGroupsWithOneFrame (): boolean {
    return !!this.itemLayout?.groups.every(group => group.length === 1)
  }

  get isOneFrameView (): boolean {
    return this.framesIndexes.length === 1
  }

  public toZeroBasedIndex (index: OriginBasedFrameIndex): ZeroBasedFrameIndex {
    if (!this.framesIndexes.length) { return index }

    const zeroBasedIndex = index - this.firstFrameIndex

    return zeroBasedIndex >= 0 ? zeroBasedIndex : 0
  }

  public toOriginBasedIndex (index: ZeroBasedFrameIndex): OriginBasedFrameIndex {
    if (!this.framesIndexes.length) { return index }

    return index + this.firstFrameIndex
  }

  public updateCameraDimensions (width?: number, height?: number): void {
    this.camera.setWidth(width || this.mainLayer.canvas.clientWidth)
    this.camera.setHeight(height || this.mainLayer.canvas.clientHeight)
  }

  public isVideoAnnotationAtPoint (annotation: VideoAnnotation, point: ImagePoint): boolean {
    const { path2D, type, isSelected } = annotation
    const renderer = this.renderManager.rendererFor(type)
    if (!renderer || !('getAllVertices' in renderer)) { return false }

    const inferredVideoAnnotationData = annotation.inferVideoData(this)
    const { data: annotationData } = inferredVideoAnnotationData

    if (Object.keys(annotationData).length === 0) { return false }

    const actualAnnotation: Annotation = annotation.shallowClone({ data: annotationData })

    if (type === 'line' || type === 'keypoint') {
      const isVertex = pointIsVertexOfPath(
        point,
        renderer.getAllVertices(actualAnnotation, this),
        5 / this.cameraScale
      )
      const { path } = renderer.getPath(actualAnnotation, this)
      return isVertex || this.isPointOnPath(point, path)
    } else if (type === 'skeleton') {
      const isVertex = pointIsVertexOfPath(
        point,
        renderer.getAllVertices(actualAnnotation, this),
        5 / this.cameraScale
      )
      if (
        !annotation.annotationClass ||
        !annotation.annotationClass.metadata.skeleton
      ) { return false }

      const { skeleton: { edges } } = annotation.annotationClass.metadata
      if (!isSkeleton(annotationData)) {
        throw new Error('editor: expected annotation of skeleton type')
      }
      const { nodes } = annotationData
      const paths = getEdgesAsPaths(nodes, edges)
      return isVertex || this.isPointOnPaths(point, paths)
    } else if (path2D) {
      // only check vertex if selected
      const isVertex = isSelected && pointIsVertexOfPath(
        point,
        renderer.getAllVertices(actualAnnotation, this),
        5 / this.cameraScale
      )
      return isVertex || this.isPointInPath2D(path2D, point)
    }

    const { path, additionalPaths } = renderer.getPath(actualAnnotation, this)
    return (
      this.isPointInPath(point, path) ||
      additionalPaths.some(p => this.isPointInPath(point, p))
    )
  }

  public isImageAnnotationAtPoint (annotation: ImageAnnotation, point: ImagePoint): boolean {
    const { path2D, type, isSelected } = annotation
    const renderer = this.renderManager.rendererFor(type)
    if (!renderer || !('getAllVertices' in renderer)) { return false }

    if (type === 'line' || type === 'keypoint' || type === 'link') {
      const isVertex = pointIsVertexOfPath(
        point,
        renderer.getAllVertices(annotation, this),
        5 / this.cameraScale
      )
      const { path } = renderer.getPath(annotation, this)
      return isVertex || this.isPointOnPath(point, path)
    } else if (type === 'skeleton') {
      const isVertex = pointIsVertexOfPath(
        point,
        renderer.getAllVertices(annotation, this),
        5 / this.cameraScale
      )
      if (
        !annotation.annotationClass ||
        !annotation.annotationClass.metadata.skeleton
      ) { return false }

      const { skeleton: { edges } } = annotation.annotationClass.metadata
      if (!isSkeleton(annotation.data)) {
        throw new Error('editor: expected annotation of skeleton type')
      }
      const { nodes } = annotation.data
      const paths = []
      for (const edge of edges) {
        const fromNode = nodes.find(node => node.name === edge.from)
        const toNode = nodes.find(node => node.name === edge.to)
        if (!fromNode || !toNode) { return false }
        paths.push([fromNode.point, toNode.point])
      }
      return isVertex || this.isPointOnPaths(point, paths)
    } else if (path2D) {
      // only check vertex if selected
      const isVertex = isSelected && pointIsVertexOfPath(
        point,
        renderer.getAllVertices(annotation, this),
        5 / this.cameraScale
      )
      return isVertex || this.isPointInPath2D(path2D, point)
    }

    const { path, additionalPaths } = renderer.getPath(annotation, this)
    return this.isPointInPath(point, path) ||
      additionalPaths.some(p => this.isPointInPath(point, p))
  }

  setAnnotations (): void {
    this.annotationsLayer.clear()
    this.annotationsOverlayLayer.clear()
    // It returns sorted array
    // Upper first. So need to reverse.
    // mainAnnotations returns new filtered array
    // so it's ok to reverse it in place.
    this.mainAnnotations.reverse().forEach((annotation: Annotation) => {
      this.annotationsLayer.add({
        id: annotation.id,
        render: () => {
          if (!annotation.isVisible) {
            this.measureManager.removeOverlayForAnnotation(annotation)
            this.overlayManager.removeOverlayForAnnotation(annotation)
            return
          }

          this.renderManager.renderSubAnnotations(this, annotation)
          this.renderManager.renderAnnotation(this, annotation, undefined, false)
        }
      })

      this.annotationsOverlayLayer.add({
        id: `overlay_${annotation.id}`,
        render: () => {
          const noOverlayTypes = ['string', 'graph']
          if (!annotation.isVisible || noOverlayTypes.includes(annotation.type)) { return }
          if (!this.isInViewport(annotation)) {
            this.overlayManager.removeOverlayForAnnotation(annotation)
            return
          }

          let actualAnnotation = annotation
          if (annotation.isVideoAnnotation()) {
            const { data: annotationData } = annotation.inferVideoData(this)
            if (Object.keys(annotationData).length === 0) {
              this.overlayManager.removeOverlayForAnnotation(annotation)
              return
            }
            actualAnnotation = annotation.shallowClone({ data: annotationData })
          }

          const { currentTool } = this.editor.toolManager
          if (currentTool?.tool?.shouldRender && !currentTool.tool.shouldRender(actualAnnotation)) {
            this.overlayManager.removeOverlayForAnnotation(annotation)
            return
          }

          this.overlayManager.updateOverlayForAnnotation(annotation)

          return undefined
        }
      })
    })
  }

  isPointOnPath (point: ImagePoint, path: EditableImagePoint[]): boolean {
    return pointOnPath(point, path, 5 / this.cameraScale)
  }

  isPointOnPaths (point: ImagePoint, paths: EditableImagePoint[][]): boolean {
    return paths.some(p => this.isPointOnPath(point, p))
  }

  isPointInPath (point: ImagePoint, path: EditableImagePoint[]): boolean {
    return (pointIsVertexOfPath(point, path, 5 / this.cameraScale) || pointInPath(point, path))
  }

  isPointInPath2D (path2D: Path2D, point: ImagePoint): boolean {
    const ctx = this.annotationsLayer.context
    if (!ctx) { return false }
    return ctx.isPointInPath(path2D, point.x, point.y, 'evenodd')
  }

  findVertexAtPath (
    paths: EditableImagePoint[][],
    point: ImagePoint,
    threshold?: number
  ): EditableImagePoint | undefined {
    const candidateVertices: EditableImagePoint[] = []
    const candidateDistances: number[] = []

    for (const path of paths) {
      for (const vertex of path) {
        const distance = euclideanDistance(point, vertex)
        threshold = threshold || (5 / this.cameraScale)
        if (distance < threshold) {
          candidateVertices.push(vertex)
          candidateDistances.push(distance)
        }
      }
    }

    if (candidateVertices.length > 0) {
      let vertex = candidateVertices[0]
      let minDistance = candidateDistances[0]
      for (let i = 1; i < candidateVertices.length; i++) {
        if (candidateDistances[i] < minDistance) {
          minDistance = candidateDistances[i]
          vertex = candidateVertices[i]
        }
      }
      return vertex
    }
  }

  selectPreviousAnnotation () {
    this.annotationMoving = undefined
    this.initialAnnotationData = undefined

    const { selectedAnnotation, visibleNonTagAnnotations: annotations } = this
    let previousAnnotation: Annotation | null = null

    if (annotations.length === 0) {
      previousAnnotation = null
    } else if (!selectedAnnotation) {
      previousAnnotation = annotations[annotations.length - 1]
    } else {
      const selectedIndex =
        annotations.findIndex(annotation => annotation.id === selectedAnnotation.id)

      if (selectedIndex <= 0) {
        previousAnnotation = annotations[annotations.length - 1]
      } else {
        previousAnnotation = annotations[selectedIndex - 1]
      }
    }

    if (previousAnnotation) { previousAnnotation.select() }
    return previousAnnotation
  }

  selectNextAnnotation () {
    this.annotationMoving = undefined
    this.initialAnnotationData = undefined

    const { selectedAnnotation, visibleNonTagAnnotations: annotations } = this
    let nextAnnotation: Annotation | null = null

    if (annotations.length === 0) {
      nextAnnotation = null
    } else if (!selectedAnnotation) {
      nextAnnotation = annotations[0]
    } else {
      const selectedIndex = annotations.findIndex(annotation =>
        annotation.id === selectedAnnotation.id)

      if (selectedIndex === annotations.length - 1) {
        nextAnnotation = annotations[0]
      } else {
        nextAnnotation = annotations[selectedIndex + 1]
      }
    }

    if (nextAnnotation) { nextAnnotation.select() }
    return nextAnnotation
  }

  public allLayersChanged (): void {
    this.layers.forEach(layer => layer.changed())
  }

  zoomTo (topLeft: Point<'Image'>, bottomRight: Point<'Image'>): void {
    this.allLayersChanged()
    this.camera.zoomToBox(
      this.camera.imageViewToCanvasView(topLeft),
      this.camera.imageViewToCanvasView(bottomRight)
    )
  }

  moveSelectedAnnotation (offset: ImagePoint): void {
    const { selectedAnnotation, selectedVertex } = this
    if (!selectedAnnotation) { return }

    this.annotationMoving =
      this.visibleMainAnnotations.find(a => a.id === selectedAnnotation.id)

    if (!this.annotationMoving) { return }

    if (!this.initialAnnotationData) {
      this.initialAnnotationData = cloneDeep(this.annotationMoving.data)
    }

    if (selectedVertex) {
      translateVertex(this.editor, selectedVertex, offset, {}, new MouseEvent('mock'))
    } else {
      translatePath(this.editor, this.annotationMoving, offset)
    }

    this.annotationMoving.path2D = undefined
    this.annotationMoving.centroid = undefined

    this.annotationsLayer.changed()
  }

  async performMoveAction (): Promise<void> {
    const { annotationMoving, initialAnnotationData } = this
    if (!annotationMoving || !initialAnnotationData) { return }

    const action = updateAnnotationData(
      this.editor,
      annotationMoving,
      initialAnnotationData,
      annotationMoving.data
    )
    await this.actionManager.do(action)
  }

  inferVideoSubAnnotations (annotation: Annotation): Annotation[] {
    const emptySubAnnotations: Annotation[] = []
    const { sub_frames: subFrames = {}, segments } = annotation.data
    if (!this.loadedVideo) { return emptySubAnnotations }
    if (!isVideoSubAnnotations(annotation.subAnnotations)) { return emptySubAnnotations }

    // Figure out if the video annotation is visible
    const range = segments?.find(
      (range: [number, number]) =>
        this.currentFrameIndex >= range[0] && this.currentFrameIndex <= range[1]
    )
    if (!range) { return emptySubAnnotations }

    const subAnnotationFrames = annotation.subAnnotations.frames
    const subkeyframe = subFrames && this.currentFrameIndex in subFrames

    // Find the closest keyframe to the left of the current index
    const prevSubIdx = subkeyframe
      ? this.currentFrameIndex
      : getPreviousFrameIndex(subFrames, this.currentFrameIndex)

    return prevSubIdx === null ? [] : subAnnotationFrames[prevSubIdx]
  }

  getVideoSubAnnotationData (annotation: Annotation): VideoSubAnnotationDataPayload {
    const emptyPayload: VideoSubAnnotationDataPayload = {
      subs: [],
      subkeyframe: false
    }
    const { sub_frames: subFrames, segments } = annotation.data
    if (!this.loadedVideo) { return emptyPayload }
    if (!isVideoSubAnnotations(annotation.subAnnotations)) { return emptyPayload }

    // Figure out if the video annotation is visible
    const range = segments?.find(
      (range: [number, number]) =>
        this.currentFrameIndex >= range[0] && this.currentFrameIndex <= range[1]
    )

    if (!range) { return emptyPayload }

    if (subFrames && this.currentFrameIndex in subFrames) {
      return {
        subs: annotation.subAnnotations.frames[this.currentFrameIndex] || [],
        subkeyframe: true
      }
    }

    return emptyPayload
  }

  inferVideoAnnotationDataOnly (
    annotationData: AnnotationData,
    annotationType: string
  ): AnnotationData {
    const {
      frames,
      sub_frames: subFrames,
      segments,
      interpolate_algorithm: algorithm,
      interpolated
    } = annotationData
    if (!this.loadedVideo) { return {} }

    // Figure out if the video annotation is visible
    const range = segments?.find(
      (range: [number, number]) =>
        this.currentFrameIndex >= range[0] && this.currentFrameIndex <= range[1]
    )

    if (!range) { return {} }

    // See if the data is present in a keyframe
    if (this.currentFrameIndex in frames) {
      return frames[this.currentFrameIndex]
    }

    if (subFrames && this.currentFrameIndex in subFrames) {
      return subFrames[this.currentFrameIndex]
    }

    // Find the closest keyframe to the left of the current index
    // and the closest keyframe to the right of the current index
    let prev: [number, any] | null = null
    let next: [number, any] | null = null
    for (const entry of Object.entries(frames)) {
      const frameIndex = parseInt(entry[0])
      if (frameIndex < this.currentFrameIndex) {
        if (!prev || (prev && frameIndex > prev[0])) {
          prev = [frameIndex, entry[1]]
        }
      } else if (frameIndex > this.currentFrameIndex) {
        if (!next || (next && frameIndex < next[0])) {
          next = [frameIndex, entry[1]]
        }
      }
    }

    if (prev === null && next !== null) { return next[1] }

    if (prev !== null && next === null) { return prev[1] }

    if (next !== null && prev !== null) {
      const renderer = this.renderManager.rendererFor(annotationType)
      if (!supportsInterpolation(renderer) || !interpolated) { return prev[1] }

      const interpolationFactor = (this.currentFrameIndex - prev[0]) / (next[0] - prev[0])
      const params: LinearInterpolationParams = {
        algorithm,
        interpolationFactor
      }

      return renderer.interpolate(prev[1], next[1], params)
    }

    return {}
  }

  inferVideoSubAnnotationDataOnly (annotationData: AnnotationData): AnnotationData {
    const { sub_frames: subFrames = {}, segments } = annotationData
    if (!this.loadedVideo) { return {} }

    // Figure out if the video annotation is visible
    const range = segments?.find(
      (range: [number, number]) =>
        this.currentFrameIndex >= range[0] && this.currentFrameIndex <= range[1]
    )
    if (!range) { return {} }

    const subkeyframe = subFrames && this.currentFrameIndex in subFrames

    const prevSubIdx = subkeyframe
      ? this.currentFrameIndex
      : getPreviousFrameIndex(subFrames, this.currentFrameIndex)

    return prevSubIdx === null ? {} : subFrames[prevSubIdx]
  }

  preselectedAnnotationClassColor (alpha: number = 1.0): string {
    alpha = clamp(alpha, 0, 1)

    const { preselectedAnnotationClass } = this
    if (!preselectedAnnotationClass) {
      return rgbaString({ r: 94, g: 235, b: 220, a: 1.0 }, alpha)
    }

    const { color } = preselectedAnnotationClass
    return rgbaString(color, alpha)
  }

  selectedAnnotationClassColor (alpha: number = 1.0): string {
    alpha = clamp(alpha, 0, 1)

    const { selectedAnnotation } = this
    if (!selectedAnnotation) {
      return rgbaString({ r: 227, g: 234, b: 242, a: 1.0 }, alpha)
    }

    const { color } = selectedAnnotation
    return rgbaString(color, alpha)
  }

  async setRawImage (base64: string): Promise<void> {
    const image = await loadImageFromUrl(base64)
    this.rawImage = image
    this.camera.setImage(image, this.isResetZoom)

    this.allLayersChanged()
  }

  protected loadPendingFrames (): void {
    // queue up all the remaining frames to be loaded
    if (!this.loadedVideo) { return }
    this.pendingFrames.clear()
    this.zeroBasedFramesIndexes.forEach(frameIndex => {
      const frame = this.zeroBasedFrames[frameIndex]

      if (!frame) { return }

      if (this.isPdfItem) {
        if (!frame.hqData) {
          this.pendingFrames.set(frameIndex, frame)
        }
      } else {
        if (!frame.lqData) {
          this.pendingFrames.set(frameIndex, frame)
        }
      }
    })
  }

  async loadFrame (index: number): Promise<void> {
    if (index < 0 || index > this.lastFrameIndex) { return }

    if (!this.loadedVideo) { return }

    if (this.pendingFrames.size === 0) { return }

    const originFrameIndex = this.toOriginBasedIndex(index)
    if (
      !this.loadedVideo.frames[originFrameIndex] ||
      this.loadedVideo.frames[originFrameIndex].hqData ||
      this.loadedVideo.frames[originFrameIndex].lqData
    ) {
      this.loadFrame(index + 1)
      return
    }

    if (!this.pendingFrames.has(index)) { return }

    const frame = this.pendingFrames.get(index)

    if (!frame) { return }

    // pdf's only load high quality frames
    if (this.isPdfItem) {
      await loadHqFrame(frame, index, this).then(() => {
        this.onFrameLoadedCallbacks.call(index)
      })
    } else {
      await loadLqFrame(frame, index, this).then(() => {
        this.onFrameLoadedCallbacks.call(index)
      })
    }

    this.pendingFrames.delete(index)

    const nextFrameToLoad = this.pendingFrames.has(this.zeroBasedCurrentFrameIndex)
      ? this.zeroBasedCurrentFrameIndex
      : index + 1

    this.loadFrame(nextFrameToLoad)
  }

  public setAnnotationClasses (classes: AnnotationClassPayload[]): void {
    this.annotationClasses = classes.map(p => new AnnotationClass(p))
    this.setSubAnnotationTypesForClasses(this.annotationClasses)
  }

  addAnnotationClass (annotationClass: AnnotationClass) {
    this.annotationClasses.push(annotationClass)
    this.addSubAnnotationTypesForClass(annotationClass)
  }

  addSubAnnotationTypesForClass (annotationClass: AnnotationClass) {
    this.subAnnotationsTypesForClasses.set(
      annotationClass.id,
      this.getSubAnnotationTypesForClass(annotationClass)
    )
  }

  // Invalidates any cached data such as path2d or centroid for all annotations
  public invalidateAnnotationCache (): void {
    this.annotations.forEach(annotation => {
      annotation.path2D = undefined
      annotation.centroid = undefined
    })
  }

  private setSubAnnotationTypesForClasses (annotationClasses: AnnotationClass[]) {
    this.subAnnotationsTypesForClasses.clear()
    annotationClasses.forEach(aclass => {
      this.subAnnotationsTypesForClasses.set(
        aclass.id, this.getSubAnnotationTypesForClass(aclass)
      )
    })
  }

  public renderHistogram (canvas: HTMLCanvasElement): void {
    const renderingImageData = this.renderingImageData

    this.clearHistogram(canvas)
    if (renderingImageData) {
      this.drawHistogram(canvas, renderingImageData, this.videoMetadata)
    }
  }

  public clearHistogram (canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d')
    if (!ctx) { return }
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  public drawHistogram (
    canvas: HTMLCanvasElement,
    imageData: ImageData,
    metadata: DatasetVideoMetadata | null = null
  ): void {
    const histogram = generateHistogramData(imageData, metadata)

    const { width, height } = canvas
    const ctx = canvas.getContext('2d')
    if (!ctx) { return }
    // The max value is 10 times the average value of nonempty columns, this is to reduce spikes
    const topValues = [...histogram].sort((a, b) => b - a)
    const maxValue = topValues.slice(0, 10).reduce((a, b) => a + b, 0) / 10

    ctx.strokeStyle = 'black'
    ctx.beginPath()
    for (let i = 0; i < histogram.length; i++) {
      ctx.moveTo(i * width / histogram.length, height)
      ctx.lineTo(
        i * width / histogram.length,
        height - height * Math.min(histogram[i] / maxValue, 1.0)
      )
    }
    ctx.stroke()
  }

  get totalItemsFrames (): number {
    // To reduce calculations.
    // Object.keys to keeps tests passes.
    // Not all tests use total_frames.
    return this.currentItem?.dataset_video?.total_frames ||
      (Object.keys(this.loadedVideo?.frames || {}).length)
  }

  get totalFrames (): number {
    // DICOM view frames count
    if (this.itemGroup) {
      return this.itemGroup.length
    }

    return this.totalItemsFrames
  }

  public isFrameIndexValid (frameIndex: number): boolean {
    if (!this.loadedVideo) { return false }
    return frameIndex >= 0 && frameIndex < this.totalFrames
  }

  public isFrameIndexRelatedToView (index: number): boolean {
    if (!this.framesIndexes.length) { return false }

    return this.firstFrameIndex <= index && this.lastFrameIndex >= index
  }

  get selectedVertex () {
    const { selectedAnnotation } = this
    if (!selectedAnnotation) { return }

    const renderer = this.renderManager.rendererFor(selectedAnnotation.type)
    if (!isMainAnnotationTypeRenderer(renderer)) { return }

    const vertices = renderer.getAllVertices(selectedAnnotation, this)
    return vertices.find(vertex => vertex.isSelected)
  }

  public get preselectedAnnotationClass (): AnnotationClass | null {
    const { annotationClasses, store: { state } } = this
    const { preselectedAnnotationClassId } = state.workview

    return annotationClasses.find(c => c.id === preselectedAnnotationClassId) || null
  }

  get tagAnnotationClasses (): AnnotationClass[] {
    return this.annotationClasses.filter(c => c.annotation_types.includes('tag'))
  }

  get nonTagAnnotations (): (Annotation & { annotationClass: AnnotationClass })[] {
    const tagClassIds = this.tagAnnotationClasses.map(a => a.id)
    return this.annotations.filter(
      (a): a is Annotation & { annotationClass: AnnotationClass } =>
        !!a.annotationClass && !tagClassIds.includes(a.annotationClass.id)
    )
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

    this.actionManager.do(changeAnnotationClass(this.editor, selectedAnnotation, newClass))
    return true
  }

  autoSelectClass () {
    const { toolManager, selectedAnnotation } = this
    const { currentTool } = toolManager
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
   * Returns a promise resolves into an annotation class compatible with the specified type
   *
   * If the preselected class is compatible, it will be returned.
   * If not, the user will be shown a class selection dialog.
   *
   * If the user cancels the selection, the promise will resolve to `null`
   */
  async resolveAnnotationClass (typeName: AnnotationTypeName): Promise<AnnotationClass | null> {
    const { preselectedAnnotationClass } = this

    if (preselectedAnnotationClass) {
      const type = this.editor.getMainAnnotationTypeForClass(preselectedAnnotationClass)
      if (type.name === typeName) {
        return preselectedAnnotationClass
      }
    }

    try {
      return await this.editor.classDialog.requestUserSelectClass(typeName)
    } catch {
      return null
    }
  }

  /**
   * Instantiates fully "filled in" annotation which is ready to be saved to
   * the backend.
   *
   * Use this function when an annotation is needed, to be passed into a custom
   * action to save it.
   *
   * This consists of
   *
   * - checking all the required data is loaded
   * - resolving actors for the annotation
   * - resolving the class by taking the preselected class, or having the user select a class
   * - resolving full annotation data
   */
  public async prepareAnnotationForCreation (
    params: Pick<
      CreateAnnotationParams,
      'id' | 'classId' | 'type' | 'data' | 'isSelected'
    >,
    subAnnotationParams?: any
  ): Promise<Annotation | void> {
    const { currentItem: item } = this
    if (!item) { return }
    if (!item.dataset_image_id && !item.dataset_video_id) { return }

    let annotationClass: AnnotationClass | null = null
    let classId: number
    if (params.classId) {
      this.store.commit('workview/PRESELECT_CLASS_ID', params.classId)
      classId = params.classId
    } else {
      annotationClass = await this.resolveAnnotationClass(params.type)
      if (!annotationClass) { return }

      this.store.commit('workview/PRESELECT_CLASS_ID', annotationClass.id)
      classId = annotationClass.id
    }

    if (item.dataset_video_id) {
      const data = params.data as VideoAnnotationData
      data.interpolate_algorithm = 'linear-1.1'
      data.segments = buildInitialSegments(this.currentFrameIndex)
      params.data = data
    }

    // this.store.state.user.profile.
    const currentUser = this.store.state.user.profile

    if (!currentUser) {
      throw new Error('unrecognized team member')
    }

    const actorPayload: AnnotationActorPayload = {
      role: 'annotator',
      user_id: currentUser.id
    }

    const annotation = Annotation.createFromInstanceParams(this, {
      id: params.id,
      actors: [actorPayload],
      type: params.type,
      classId: classId,
      data: params.data,
      zIndex: this.annotationManager.getMaxZIndex(this.annotations) + 1,
      isSelected: params.isSelected
    })
    if (!annotation) { return }

    if (!annotationClass) { return annotation }
    // subAnnotations is always default SubAnnotation when creating a new annotation
    const subAnnotations = annotation.subAnnotations as ImageSubAnnotation[]
    for (const subAnnotationType of this.getSubAnnotationTypesForClass(annotationClass)) {
      const serializer = this.editor.serializerManager.getSerializer(subAnnotationType.name)
      if (!serializer || !serializer.defaultData) { continue }

      const data = serializer.defaultData(subAnnotationParams)
      if (!data) { continue }
      const subAnnotation = this.initializeSubAnnotation(subAnnotationType.name, annotation, data)
      if (!subAnnotation) { continue }
      subAnnotations.push(subAnnotation)
    }

    return annotation
  }

  public initializeSubAnnotation (
    type: AnnotationTypeName,
    parent: Annotation,
    data: AnnotationData
  ): Annotation | null {
    return Annotation.createSubAnnotation(this, { parent, data, type })
  }

  public updateAnnotationData (
    annotation: Annotation,
    data: AnnotationData
  ): void {
    annotation.data = data
  }

  public updateAnnotationSubs (
    annotation: Annotation,
    videoSubs: VideoSubAnnotations
  ): void {
    annotation.subAnnotations = videoSubs
  }

  public updateAnnotationFrame (
    annotation: Annotation,
    frame: AnnotationData,
    subs: Annotation[],
    index: number
  ): void {
    if (!annotation.isVideoAnnotation()) { return }

    const { frames: dataFrames } = annotation.data
    const { frames: subsFrames } = annotation.subAnnotations
    if (dataFrames === undefined || subsFrames === undefined) { return }

    const updatedDataFrames = { ...dataFrames, [index]: frame }
    this.updateAnnotationData(annotation, { ...annotation.data, frames: updatedDataFrames })
    this.updateAnnotationSubs(annotation, { ...annotation.subAnnotations })
  }

  get isVersion2 (): boolean {
    return this.store.getters['dataset/isVersion2']
  }

  get selectedAnnotationVertices (): EditableImagePoint[] {
    const selectedAnnotation = this.annotations.find(annotation => annotation.isSelected)
    if (!selectedAnnotation) { return [] }

    const renderer = this.renderManager.rendererFor(selectedAnnotation.type)
    if (!isMainAnnotationTypeRenderer(renderer)) { return [] }

    return renderer.getAllVertices(selectedAnnotation, this)
  }

  selectPreviousVertex (): void {
    const { selectedAnnotationVertices: vertices } = this
    const selectedIndex = vertices.findIndex(vertex => vertex.isSelected)

    if (selectedIndex >= 0) {
      vertices[selectedIndex].isSelected = false
    }

    const vertexIndex = selectedIndex <= 0 ? vertices.length - 1 : selectedIndex - 1
    vertices[vertexIndex].isSelected = true

    this.annotationsLayer.changed()
  }

  selectNextVertex (): void {
    const { selectedAnnotationVertices: vertices } = this
    const selectedIndex = vertices.findIndex(vertex => vertex.isSelected)

    if (selectedIndex >= 0) {
      vertices[selectedIndex].isSelected = false
    }

    const vertexIndex = selectedIndex === vertices.length - 1 ? 0 : selectedIndex + 1
    vertices[vertexIndex].isSelected = true

    this.annotationsLayer.changed()
  }

  /**
   * Runs the entire process creating an annotation from given params, in given
   * action group, or in the "global" action manager.
   *
   * The process
   */
  async createAnnotation (
    params: Pick<
      CreateAnnotationParams,
      'id' | 'classId' | 'type' | 'data' | 'isSelected'
    >,
    actionGroup?: ActionGroup,
    subAnnotationParams?: any
  ): Promise<Annotation | void> {
    const annotation = await this.prepareAnnotationForCreation(params, subAnnotationParams)
    if (!annotation) { return }

    const actor = actionGroup || this.actionManager
    await actor.do(addAnnotationAction(this.editor, annotation))

    return annotation
  }

  async createAnnotations (
    paramsList: Pick<
      CreateAnnotationParams,
      'id' | 'classId' | 'type' | 'data' | 'isSelected'
    >[],
    actionGroup?: ActionGroup,
    subAnnotationParamsList?: any[]
  ): Promise<Annotation[] | undefined> {
    const annotations = []
    for (let i = 0; i < paramsList.length; i++) {
      const params = paramsList[i]
      const subAnnotationParams = subAnnotationParamsList && subAnnotationParamsList[i]
        ? subAnnotationParamsList[i]
        : undefined

      const annotation = await this.prepareAnnotationForCreation(params, subAnnotationParams)
      if (!annotation) { return }

      annotations.push(annotation)
    }

    const actor = actionGroup || this.actionManager
    await actor.do(addAnnotationsAction(this.editor, annotations))

    return annotations
  }

  async removeAnnotation (payload: { id: string }, actionGroup?: ActionGroup): Promise<void> {
    const { annotations } = this
    const annotation = annotations.find(a => a.id === payload.id)
    if (!annotation) { return }
    const actor = actionGroup || this.actionManager
    await actor.do(deleteAnnotationAction(this.editor, annotation))
  }

  /**
   * Called when the current item changes in the store
   *
   * Triggers loading of image and sets loaded information so it can be rendered
   *
   * Since the editor is not a Vue component, we do not have automatic access to
   * previous value, meaning we have to infer if the item image changed by looking
   * the data in the item and the old stored loadedImage.
   *
   * Returns if the current item was changed or not
   */
  async setItem (
    item: DatasetItemPayload | null,
    framesGroup: number[] | null = null
  ): Promise<void> {
    this.pendingFrames.clear()
    this.currentItem = item

    this.annotationsLayer.clear()
    this.mainLayer.remove('image')
    this.mainLayer.add({
      id: 'image',
      render: () => {
        const { loadedImage, loadedVideo, rawImage } = this

        if (loadedImage) {
          this.renderManager.drawImageOnCanvas(
            this.editor,
            this.camera,
            this.mainLayer.canvas,
            loadedImage
          )
        }

        if (rawImage) {
          const imageData = loadImageData(rawImage)
          const annotationImage: LoadedImageWithTiles = {
            id: -1,
            datasetImageId: null,
            taskId: null,
            url: '',
            thumbnailURL: '',
            originalFilename: '',
            width: rawImage.width,
            height: rawImage.height,
            data: {
              data: rawImage,
              rawData: imageData,
              transformedData: null,
              lastWindowLevels: this.windowLevelsRange,
              lastColorMap: 'default'
            },
            cache: {}
          }

          return this.renderManager.renderRaw(this, annotationImage)
        }

        if (loadedVideo) {
          return this.renderManager.renderVideoByIndex(
            this,
            this.currentFrameIndex,
            loadedVideo
          )
        }
      }
    })

    if (this.isDicomItem) {
      this.mainLayer.add({
        id: 'windowLevels',
        render: () => {
          if (this.editor.pluginManager.isWindowLevelPluginActive) {
            this.renderManager.renderWindowLevels(this)
          }
        }
      })
    }

    this.framesGroup = framesGroup

    const { currentItem, loadingItem, loadedImage, loadedVideo, isDicomItem } = this
    if (!currentItem) { return }

    if (isDicomItem) {
      this.setCanvasBackground('#000')
    }

    // Only need to do the reset/reload if item actually changed
    // Item could also change if it gets a workflow, or gets assigned,
    // in which case, the item remains the same.
    let itemChanged = currentItem.dataset_video
      ? !loadedVideo || loadedVideo.id !== currentItem.dataset_video.id
      : currentItem.dataset_image &&
          (!loadedImage || loadedImage.id !== currentItem.dataset_image.image.id)

    // This means that the current item is still being loaded in the background.
    if (itemChanged && loadingItem) {
      itemChanged = loadingItem.id !== currentItem.id
    }

    if (!itemChanged) { return }

    // Reset the current image filter's window level
    this.setImageFilter({
      ...this.imageFilter,
      windowLevels: this.defaultWindowLevels,
      isImageSmoothing: this.defaultImageSmoothing
    })

    // Reset tool
    const { currentTool } = this.toolManager
    if (currentTool) { currentTool.tool.reset(currentTool.context) }

    // Clear old action history.
    // We don't want to redo an action from a different image onto this one.
    this.actionManager.clear()

    // Removes old loaded image so it doesn't appear on the canvas
    // while new one is loading.
    this.loadedImage = null
    this.loadedVideo = null

    // Load new loaded image
    this.loadingItem = currentItem
    const response: { data: LoadedImageWithTiles | LoadedVideo } | { error: any } =
      await this.store.dispatch('workview/loadItem', currentItem)
    this.loadingItem = null

    if ('error' in response) {
      await this.store.dispatch('toast/warning', { content: response.error.message })
      return
    }

    if ('data' in response) {
      if (!this.currentItem || !belongsToItem(response.data, this.currentItem)) {
        return
      }

      // destructure to create copy, because we need to add properties for tiling
      if ('frames' in response.data) {
        this.loadedVideo = cloneDeep(response.data)
        const firstSeq = Math.min(...Object.keys(this.loadedVideo!.frames).map(k => parseInt(k)))
        this.loadPendingFrames()
        this.jumpToFrame(firstSeq, true)
        // Recalculates default window levels for loaded video
        this.setImageFilter({
          ...this.imageFilter,
          windowLevels: this.defaultWindowLevels
        })
        return
      }

      // Set new loaded image on canvas
      // we destructure to create copy,
      // because we need to add properties for tiling
      this.loadedImage = cloneDeep(response.data)
      this.setImageFilter({
        ...this.imageFilter,
        isImageSmoothing: this.defaultImageSmoothing,
        windowLevels: this.defaultWindowLevels
      })
      this.camera.setImage(response.data, this.isResetZoom)
      this.mainLayer.changed()
    }
  }

  get isResetZoom (): boolean {
    return this.store.state.workview.resetZoomMode === RESET_ZOOM_MODE.RESET
  }

  /**
   * Sets active frame by index
   * @param frameIndex - counter start from 0
   * @param resetZoom
   * @returns
   */
  async jumpToFrame (frameIndex: number, resetZoom: boolean = false): Promise<void> {
    if (
      frameIndex < this.toZeroBasedIndex(this.firstFrameIndex) ||
      frameIndex > this.toZeroBasedIndex(this.lastFrameIndex)
    ) { return }
    if (!this.loadedVideo) { return }
    if (!this.framesIndexes.length) { return }

    this.loadFrame(frameIndex)

    // Need to restrict the frameIndex range into valid range.
    const totalFrames = this.framesIndexes.length
    this.zeroBasedCurrentFrameIndex = Math.max(0, Math.min(frameIndex, totalFrames - 1))

    /**
     * Await for first frame to be loaded
     *
     * For Normal videos, we load `lqFrame` first and load `hqframe`.
     * For DICOM videos, we load `lqFrame` first and load `hqframe` after
     * For PDF videos, we only load `hqFrame`.
     */
    if (this.currentFrameIndex in this.frames) {
      const frame = this.frames[this.currentFrameIndex]
      if (frame.hqData) {
        this.camera.setImage(frame.hqData.data, resetZoom)
      } else if (frame.lqData) {
        this.camera.setImage(frame.lqData.data, resetZoom)
        loadHqFrame(frame, this.currentFrameIndex, this).then(() => {
          this.onFrameLoadedCallbacks.call(frameIndex)
        })
      } else {
        if (this.isPdfItem) {
          await loadHqFrame(frame, this.currentFrameIndex, this).then(() => {
            this.onFrameLoadedCallbacks.call(frameIndex)
          })
        } else {
          await loadLqFrame(frame, this.currentFrameIndex, this).then(() => {
            this.onFrameLoadedCallbacks.call(frameIndex)
          })
        }
        if (resetZoom) { this.scaleToFit() }
        if (!this.isPdfItem) {
          loadHqFrame(frame, this.currentFrameIndex, this).then(() => {
            this.onFrameLoadedCallbacks.call(frameIndex)
          })
        }
      }
    }

    this.editor.invalidateAnnotationCache()
    // jumping between frames changes subAnnotation content so the redraw option is enabled

    this.allLayersChanged()
  }

  public scaleToFit (): void {
    this.camera.scaleToFit()
    this.allLayersChanged()
  }

  public setImageFilter (filter: ImageManipulationFilter): void {
    this.imageFilter = filter

    /**
     * Sets filter using css
     * renderManager.setImageFilter sets separate filter using canvases context
     * keep it separate to not multiply props
     * eg. color map and saturation
     */
    this.mainLayer.canvas.style.filter = getCSSFilterString(filter)

    this.renderManager.setImageFilter(filter)

    this.allLayersChanged()
  }

  public render (): void {
    this.layers.forEach(layer => {
      layer.render()
    })
  }

  setInferenceData (
    results: InferenceResult[],
    classes: TrainedModelPayload['classes']
  ): void {
    this.annotationsOverlayLayer.clear()
    this.annotationsLayer.clear()

    this.inferenceData = results
      .map(payload => Annotation.createFromInferenceData(this, payload, classes))
      .filter(a => a !== null) as Annotation[]

    this.inferenceData.forEach(annotation => {
      this.annotationsLayer.add({
        id: `inference_${annotation.id}`,
        render: () => {
          if (!annotation.isVisible) { return }
          this.renderManager.renderSubAnnotations(this, annotation)
          this.renderManager.renderAnnotation(this, annotation, undefined, true)
        }
      })

      this.annotationsOverlayLayer.add({
        id: `overlay_inference_${annotation.id}`,
        render: () => {
          if (!annotation.isVisible) { return }
          if (!this.isInViewport(annotation)) {
            this.overlayManager.removeOverlayForAnnotation(annotation)
            return
          }

          let actualAnnotation = annotation
          if (annotation.isVideoAnnotation()) {
            const { data: annotationData } = annotation.inferVideoData(this)
            if (Object.keys(annotationData).length === 0) {
              this.overlayManager.removeOverlayForAnnotation(annotation)
              return
            }
            actualAnnotation = annotation.shallowClone({ data: annotationData })
          }

          const { currentTool } = this.editor.toolManager
          if (currentTool?.tool?.shouldRender && !currentTool.tool.shouldRender(actualAnnotation)) {
            this.overlayManager.removeOverlayForAnnotation(annotation)
            return
          }

          this.overlayManager.updateOverlayForAnnotation(annotation)

          return undefined
        }
      })
    })

    this.annotationsLayer.changed()
  }

  get mainAnnotationTypes (): AnnotationTypeName[] {
    return Array.from(this.annotationTypes.keys())
  }

  get subAnnotationTypes (): AnnotationTypeName[] {
    const subs: Set<AnnotationTypeName> = new Set()
    for (const subAnnotationTypes of this.annotationTypes.values()) {
      for (const sub of subAnnotationTypes) {
        subs.add(sub)
      }
    }
    return Array.from(subs.values())
  }

  /**
   * Returns a mapping of main annotation type to it's sub types for every class in the editor
   *
   * Example
   * ```
   * {
   *   polygon: ['directional_vector', 'auto_annotate'],
   *   bounding_box: ['text', 'attributes']
   * }
   * ```
   */
  get annotationTypes (): Map<AnnotationTypeName, AnnotationTypeName[]> {
    const annotationTypes: Map<AnnotationTypeName, AnnotationTypeName[]> = new Map()
    for (const annotationType of this.store.state.aclass.types) {
      if (!annotationTypes.has(annotationType.name) && annotationType.granularity === 'main') {
        const subs = annotationType.subs.map(ann => ann.name)
        annotationTypes.set(annotationType.name, subs)
      }
    }

    return annotationTypes
  }

  async runInference (
    runningSessionId: string,
    data: InferenceData | AutoAnnotateInferencePayload
  ) {
    const payload: StoreActionPayload<typeof runInference> = {
      data,
      runningSessionId
    }

    const response: StoreActionResponse<typeof runInference> =
      await this.store.dispatch('workview/runInference', payload)

    if ('error' in response) {
      this.store.dispatch('toast/warning', { content: response.error.message })
      return response
    }

    const isClicker = isPreselectedModelAutoAnnotate(this.editor)
    const isClickerFirstSend = isClickerData(data) && isClicker && data.data.clicks.length === 0
    if (isClickerFirstSend) {
      this.store.dispatch('workviewTracker/reportAutomationAction')
    } else if (!isClicker) {
      this.store.dispatch('workviewTracker/reportModelTool')
    }

    return response
  }

  playVideo (): void {
    if (this.isPlaying) { return }
    if (!this.loadedVideo) { return }
    this.isPlaying = true
    const length = this.framesIndexes.length

    this.videoInterval = setInterval(() => {
      if (!this.loadedVideo) { return }

      const nextFrameIndex = (this.zeroBasedCurrentFrameIndex + 1) % length
      if (
        !this.loadedVideo.frames[this.toOriginBasedIndex(nextFrameIndex)] ||
        (
          !this.loadedVideo.frames[this.toOriginBasedIndex(nextFrameIndex)].hqData &&
          !this.loadedVideo.frames[this.toOriginBasedIndex(nextFrameIndex)].lqData
        )
      ) {
        this.loadFrame(nextFrameIndex)
        return
      }
      this.zeroBasedCurrentFrameIndex = nextFrameIndex
      this.invalidateAnnotationCache()
      this.allLayersChanged()
    }, 1000 / 24)
  }

  stopVideo (): void {
    if (!this.isPlaying) { return }
    if (!this.loadedVideo) { return }
    clearInterval(this.videoInterval)
    this.isPlaying = false

    // Since the video just stopped, ensure that we are loading the hq frame
    // If video is dicom, then do not load hq frames
    // If video is pdf, we always load hq frames so no need to reload it again
    if (!this.isDicomItem && !this.isPdfItem) {
      const frameIndex = this.currentFrameIndex
      loadHqFrame(
        this.loadedVideo.frames[this.currentFrameIndex],
        frameIndex,
        this
      ).then(() => {
        this.onFrameLoadedCallbacks.call(frameIndex)
        this.mainLayer.changed()
      })
    }
  }

  toggleVideo (): void {
    if (this.isPlaying) {
      this.stopVideo()
    } else {
      this.playVideo()
    }
  }

  get isImageLoading (): boolean {
    if (this.editor.embedded) { return false }

    const { isDicomItem, loadedImage, loadedVideo } = this

    if (!loadedImage && !loadedVideo) { return true }
    if (loadedImage) {
      if (isDicomItem) {
        return !(loadedImage.data && loadedImage.data.transformedData)
      }
      return !loadedImage.data
    }
    if (loadedVideo) {
      const currentFrame = loadedVideo.frames[this.currentFrameIndex]

      if (!currentFrame) { return true }

      if (isDicomItem) {
        // For now, we only load lqData for dicom videos
        return !(currentFrame.lqData && currentFrame.lqData.transformedData)
      }

      return !(currentFrame.lqData || currentFrame.hqData)
    }
    return false
  }

  createKeyFrame (annotation: Annotation | null, frameIndex: number): void {
    if (!annotation || !annotation.isVideoAnnotation()) { return }
    if (!this.isFrameIndexValid(frameIndex)) { return }

    const action = createKeyframeAction(this.editor, annotation, frameIndex)
    this.actionManager.do(action)
  }

  deleteKeyFrame (annotation: Annotation | null, key: number | null): void {
    if (!annotation || !key) { return }

    const action = deleteKeyframeAction(this.editor, annotation, key)
    this.actionManager.do(action)
  }

  get canForceRenderSubAnnotations (): boolean {
    return this.annotations.length <= View.RERENDER_LIMIT
  }

  findTopAnnotationAt (
    point: ImagePoint,
    filter?: (annotation: Annotation) => boolean
  ): Annotation | undefined {
    const visibleMainAnnotations = filter
      ? this.visibleMainAnnotations.filter(filter)
      : this.visibleMainAnnotations

    const ctx = this.annotationsLayer.context
    if (!ctx) { return }

    return visibleMainAnnotations
      .sort(compareByZIndexCamelcase)
      .find(annotation => {
        if (annotation.isImageAnnotation()) {
          return this.isImageAnnotationAtPoint(annotation, point)
        }

        if (annotation.isVideoAnnotation()) {
          return this.isVideoAnnotationAtPoint(annotation, point)
        }

        return false
      })
  }

  /**
   * Instantiates basic annotation from given params, not resolving any data internally
   */
  public initializeAnnotation (
    params: Pick<CreateAnnotationParams, 'actors' | 'id' | 'type' | 'data' | 'classId'>
  ): Annotation | null {
    const { annotations, currentItem } = this
    if (!currentItem) {
      throw new EditorError('Cannot initialize annotation. No item set')
    }

    return Annotation.createFromInstanceParams(this, {
      ...params,
      id: params.id,
      classId: params.classId,
      data: params.data,
      type: params.type,
      zIndex:
        params.type === 'tag'
          ? null
          : annotations[0] && annotations[0].zIndex !== null ? annotations[0].zIndex + 1 : 1
    })
  }

  get cameraScale (): number {
    return this.camera.scale
  }

  public disableAnnotationOverlays (): void {
    this.store.commit('workview/SET_ANNOTATION_OVERLAY_DISABLED', true)
  }

  public enableAnnotationOverlays (): void {
    this.store.commit('workview/SET_ANNOTATION_OVERLAY_DISABLED', false)
  }

  /**
   * Holds a list of components dynamically added by plugins,
   * which are rendered at the same DOM level as the canvas.
   *
   * Components can be positioned absolute so they can be given position at a
   * certain location above the canvas if necessary.
   *
   * Use the public `addComponent` and `removeComponent` functions
   * from the plugin to manage these.
   */
  public components: { id: string, name: string, props: any }[] = []

  /**
   * Add a component to be rendered outside canvas
   */
  public addComponent (params: { id: string, name: string, props: any }): void {
    const { id, name, props } = params
    const index = this.components.findIndex(c => c.id === id)
    if (index === -1) { this.components.push({ id, name, props }) }
  }

  /**
   * Remove an existing component by specified id
   */
  public removeComponent (id: string): void {
    const index = this.components.findIndex(c => c.id === id)
    if (index > -1) { this.components.splice(index, 1) }
  }

  /**
   * Finds the annotation vertex that matches the position of a given point with
   * a given threshold.
   *
   * All the highlighted annotations will be looped over until a match is found.
   *
   * @param point The position the vertex needs to match
   * @param threshold The position tolerance between the potential vertex and given point
   */
  public findAnnotationVertexAt (
    point: ImagePoint,
    threshold?: number
  ): EditableImagePoint | undefined {
    for (const annotation of this.highlightedAnnotations) {
      const vertex = this.doFindAnnotationVertexAt(annotation, point, threshold)
      if (!vertex) { continue }
      return vertex
    }
  }

  private doFindAnnotationVertexAt (
    annotation: Annotation,
    point: ImagePoint,
    threshold?: number
  ): EditableImagePoint | undefined {
    const renderer = this.renderManager.rendererFor(annotation.type)
    if (!isMainAnnotationTypeRenderer(renderer)) { return }

    if (!annotation.isVideoAnnotation()) {
      const path = renderer.getAllVertices(annotation, this)
      return this.findVertexAtPath([path], point, threshold)
    }
    const inferredVideoAnnotationData = annotation.inferVideoData(this)
    const { data: annotationData } = inferredVideoAnnotationData
    if (Object.keys(annotationData).length === 0) { return }

    const actualAnnotation: Annotation = annotation.shallowClone({ data: annotationData })
    const path = renderer.getAllVertices(actualAnnotation, this)
    return this.findVertexAtPath([path], point, threshold)
  }

  /**
   * Returns true if the annotation is already added to the current image
   * @param annotation
   */
  hasAnnotation (annotation: Annotation): boolean {
    return this.visibleAnnotations.findIndex(c => c.id === annotation.id) > -1
  }

  unhighlightAllVerticesInPath (paths: EditableImagePoint[][]): void {
    for (const path of paths) {
      for (const vertex of path) { vertex.isHighlighted = false }
    }
  }

  unhighlightAllAnnotationsVertices (): void {
    this.highlightedVertices.forEach(vertex => { vertex.isHighlighted = false })
  }

  unhighlightAllVertices (): void {
    this.unhighlightAllAnnotationsVertices()
    this.commentManager.unhighlightAllCommentThreadVertices()
  }

  deselectAllVerticesInPath (paths: EditableImagePoint[][]): void {
    for (const path of paths) {
      for (const vertex of path) { vertex.isSelected = false }
    }
  }

  deselectAllAnnotationsVertices (): void {
    const paths: EditableImagePoint[][] = this.visibleMainAnnotations
      .map(annotation => {
        const renderer = this.renderManager.rendererFor(annotation.type)
        if (renderer && 'getAllVertices' in renderer) {
          if (!annotation.isVideoAnnotation()) {
            return renderer.getAllVertices(annotation, this)
          }
          const { data: videoData } = annotation.inferVideoData(this)
          if (Object.keys(videoData).length === 0) { return [] }
          const actualAnnotation: Annotation = annotation.shallowClone({ data: videoData })
          return renderer.getAllVertices(actualAnnotation, this)
        }
        return []
      })

    this.deselectAllVerticesInPath(paths)
  }

  deselectAllVertices (): void {
    this.deselectAllAnnotationsVertices()
    this.commentManager.deselectAllCommentThreadVertices()
  }

  unhighlightAll (): void {
    this.unhighlightAllAnnotations()
    this.commentManager.unhighlightAllCommentThreads()
  }

  deselectAll (): void {
    this.deselectAllAnnotations()
    this.commentManager.deselectAllCommentThreads()
  }

  unhighlightAllAnnotations (): void {
    const { highlightedAnnotations } = this
    if (highlightedAnnotations.length === 0) { return }
    this.store.commit('workview/UNHIGHLIGHT_ALL_ANNOTATIONS')
  }

  deselectAllAnnotations (): void {
    const { selectedAnnotation } = this
    if (selectedAnnotation) {
      selectedAnnotation.deselect()
    } else {
      this.store.commit('workview/DESELECT_ALL_ANNOTATIONS')
    }
  }

  private callbacksAreActive: boolean = true;

  public onModelsChangedCallbacks: CallbackHandleCollection<[RunningSessionPayload[]]> =
    new CallbackHandleCollection<[RunningSessionPayload[]]>();

  private onDoubleClickCallbacks: CallbackHandleCollection<[MouseEvent]> =
    new CallbackHandleCollection<[MouseEvent]>()

  private onMouseDownCallbacks: CallbackHandleCollection<[MouseEvent]> =
    new CallbackHandleCollection<[MouseEvent]>()

  private onMouseUpCallbacks: CallbackHandleCollection<[MouseEvent]> =
    new CallbackHandleCollection<[MouseEvent]>()

  private onMouseMoveCallbacks: CallbackHandleCollection<[MouseEvent]> =
    new CallbackHandleCollection<[MouseEvent]>()

  private onMouseLeaveCallbacks: CallbackHandleCollection<[MouseEvent]> =
    new CallbackHandleCollection<[MouseEvent]>()

  private onGestureStartCallbacks: CallbackHandleCollection<[Event]> =
    new CallbackHandleCollection<[Event]>()

  private onGestureChangeCallbacks: CallbackHandleCollection<[Event]> =
    new CallbackHandleCollection<[Event]>()

  private onGestureEndCallbacks: CallbackHandleCollection<[Event]> =
    new CallbackHandleCollection<[Event]>()

  private onWheelCallbacks: CallbackHandleCollection<[WheelEvent]> =
    new CallbackHandleCollection<[WheelEvent]>()

  private onTouchStartCallbacks: CallbackHandleCollection<[TouchEvent]> =
    new CallbackHandleCollection<[TouchEvent]>()

  private onTouchEndCallbacks: CallbackHandleCollection<[TouchEvent]> =
    new CallbackHandleCollection<[TouchEvent]>()

  private onTouchMoveCallbacks: CallbackHandleCollection<[TouchEvent]> =
    new CallbackHandleCollection<[TouchEvent]>()

  public onOnKeyDownCallbacks: CallbackHandleCollection<[KeyboardEvent]> =
    new CallbackHandleCollection<[KeyboardEvent]>()

  public onOnKeyPressCallbacks: CallbackHandleCollection<[KeyboardEvent]> =
    new CallbackHandleCollection<[KeyboardEvent]>()

  public onOnKeyUpCallbacks: CallbackHandleCollection<[KeyboardEvent]> =
    new CallbackHandleCollection<[KeyboardEvent]>()

  public activateCallbacks (): void {
    this.callbacksAreActive = true
  }

  public deactivateCallbacks (): void {
    this.callbacksAreActive = false
  }

  // Callbacks
  public onModelsChanged (cb: (models: RunningSessionPayload[]) => void): CallbackHandle {
    return this.onModelsChangedCallbacks.add(cb)
  }

  public onDoubleClick (cb: (event: MouseEvent) => void): CallbackHandle {
    return this.onDoubleClickCallbacks.add(cb)
  }

  public onMouseDown (cb: (event: MouseEvent) => void): CallbackHandle {
    return this.onMouseDownCallbacks.add(cb)
  }

  public onMouseUp (cb: (event: MouseEvent) => void): CallbackHandle {
    return this.onMouseUpCallbacks.add(cb)
  }

  public onMouseMove (cb: (event: MouseEvent) => void): CallbackHandle {
    return this.onMouseMoveCallbacks.add(cb)
  }

  public onMouseLeave (cb: (event: MouseEvent) => void): CallbackHandle {
    return this.onMouseLeaveCallbacks.add(cb)
  }

  public onGestureStart (cb: (event: Event) => void): CallbackHandle {
    return this.onGestureStartCallbacks.add(cb)
  }

  public onGestureChange (cb: (event: Event) => void): CallbackHandle {
    return this.onGestureChangeCallbacks.add(cb)
  }

  public onGestureEnd (cb: (event: Event) => void): CallbackHandle {
    return this.onGestureEndCallbacks.add(cb)
  }

  public onWheel (cb: (event: WheelEvent) => void): CallbackHandle {
    return this.onWheelCallbacks.add(cb)
  }

  public onTouchStart (cb: (event: TouchEvent) => void): CallbackHandle {
    return this.onTouchStartCallbacks.add(cb)
  }

  public onTouchEnd (cb: (event: TouchEvent) => void): CallbackHandle {
    return this.onTouchEndCallbacks.add(cb)
  }

  public onTouchMove (cb: (event: TouchEvent) => void): CallbackHandle {
    return this.onTouchMoveCallbacks.add(cb)
  }

  public onKeyDown (cb: (event: KeyboardEvent) => void): CallbackHandle {
    return this.onOnKeyDownCallbacks.add(cb)
  }

  public onKeyPress (cb: (event: KeyboardEvent) => void): CallbackHandle {
    return this.onOnKeyPressCallbacks.add(cb)
  }

  public onKeyUp (cb: (event: KeyboardEvent) => void): CallbackHandle {
    return this.onOnKeyUpCallbacks.add(cb)
  }

  public canvasListeners: { [s: string]: ListenerDefinition } = {
    dblclick: (event) => {
      if (this.callbacksAreActive && this.hitTarget(event)) {
        this.onDoubleClickCallbacks.call(event as MouseEvent)
      }
    },
    mousedown: (event) => {
      if (this.callbacksAreActive && this.hitTarget(event)) {
        this.disableAnnotationOverlays()
        this.onMouseDownCallbacks.call(event as MouseEvent)
      }
    },
    mouseup: (event) => {
      if (this.callbacksAreActive && this.hitTarget(event)) {
        this.enableAnnotationOverlays()
        this.onMouseUpCallbacks.call(event as MouseEvent)
      }
    },
    mousemove: (event) => {
      if (this.callbacksAreActive && this.hitTarget(event)) {
        this.onMouseMoveCallbacks.call(event as MouseEvent)
      }
    },
    mouseleave: (event) => {
      if (this.callbacksAreActive && this.hitTarget(event)) {
        this.onMouseLeaveCallbacks.call(event as MouseEvent)
      }
    },
    touchstart: (event) => {
      if (this.callbacksAreActive && this.hitTarget(event)) {
        this.disableAnnotationOverlays()
        this.onTouchStartCallbacks.call(event as TouchEvent)
      }
    },
    touchend: (event) => {
      if (this.callbacksAreActive && this.hitTarget(event)) {
        this.enableAnnotationOverlays()
        this.onTouchEndCallbacks.call(event as TouchEvent)
      }
    },
    touchmove: (event) => {
      if (this.callbacksAreActive && this.hitTarget(event)) {
        this.onTouchMoveCallbacks.call(event as TouchEvent)
      }
    },
    wheel: {
      listener: (event): void => {
        if (this.callbacksAreActive && this.hitTarget(event)) {
          this.onWheelCallbacks.call(event as WheelEvent)
        }
      },
      options: { passive: false }
    },
    gesturestart: (event) => {
      if (this.callbacksAreActive && this.hitTarget(event)) {
        this.onGestureStartCallbacks.call(event as MouseEvent)
      }
    },
    gesturechange: (event) => {
      if (this.callbacksAreActive && this.hitTarget(event)) {
        this.onGestureChangeCallbacks.call(event as MouseEvent)
      }
    },
    gestureend: (event) => {
      if (this.callbacksAreActive && this.hitTarget(event)) {
        this.onGestureEndCallbacks.call(event as MouseEvent)
      }
    }
  }

  readonly permanentListenersKeys: string[] = ['mousemove']

  private addPermanentListeners (): void {
    const target = this.editor.embedded ? this.annotationsLayer.canvas : window
    Object.keys(this.canvasListeners)
      .filter(key => this.permanentListenersKeys.includes(key))
      .forEach(key => addListener(target, [key, this.canvasListeners[key]]))
  }

  public addListeners (): void {
    const target = this.editor.embedded ? this.annotationsLayer.canvas : window
    Object.keys(this.canvasListeners)
      .filter(key => !this.permanentListenersKeys.includes(key))
      .forEach(key => addListener(target, [key, this.canvasListeners[key]]))
  }

  public removeListeners (includePermanent?: boolean): void {
    const target = this.editor.embedded ? this.annotationsLayer.canvas : window

    let listenersKeys = Object.keys(this.canvasListeners)

    if (!includePermanent) {
      listenersKeys = listenersKeys.filter(key => !this.permanentListenersKeys.includes(key))
    }

    listenersKeys.forEach(key => removeListener(target, [key, this.canvasListeners[key]]))
  }

  public cleanup (): void {
    this.inferenceData = []
    this.annotationClasses = []
    clearInterval(this.videoInterval)
    this.isPlaying = false
    this.layers.forEach(layer => {
      layer.destroy()
    })
    this.renderManager.cleanup()
    this.pendingFrames.clear()
    this.overlayManager.cleanup()
    this.removeListeners(true)
    this.annotationManager.cleanup()
    this.loadingItem = null
    this.onFrameLoadedCallbacks.clear()
    this.onModelsChangedCallbacks.clear()
    this.onDoubleClickCallbacks.clear()
    this.onMouseDownCallbacks.clear()
    this.onMouseUpCallbacks.clear()
    this.onMouseMoveCallbacks.clear()
    this.onMouseLeaveCallbacks.clear()
    this.onGestureStartCallbacks.clear()
    this.onGestureChangeCallbacks.clear()
    this.onGestureEndCallbacks.clear()
    this.onWheelCallbacks.clear()
    this.onTouchStartCallbacks.clear()
    this.onTouchEndCallbacks.clear()
    this.onTouchMoveCallbacks.clear()
    this.onOnKeyDownCallbacks.clear()
    this.onOnKeyPressCallbacks.clear()
    this.onOnKeyUpCallbacks.clear()
    Vue.delete(this, '_showPills')
    this.onCleanup.forEach(callback => callback())
    this.onCleanup = []
  }

  /**
   * Prepares instance to release the memory
   */
  public destroy (): void {
    this.cleanup()

    // @ts-ignore
    this.annotationManager = null
    // @ts-ignore
    this.measureManager = null
    // @ts-ignore
    this.toolManager = null
    // @ts-ignore
    this.overlayManager = null
    // @ts-ignore
    this.actionManager = null
  }

  protected setCanvasBackground (color: string): void {
    this.mainLayer.canvas.style.background = color
  }

  public isInViewport (annotation: Annotation): boolean {
    const { camera } = this
    const bbox = annotation.getBBox(this)

    if (!bbox) { return true }

    const { x, y, width, height } = bbox as BBox
    const halfWidth = width / 2
    const halfHeight = height / 2

    if (x === Infinity || y === Infinity) { return true }

    return (x + halfWidth >= 0 && x - halfWidth <= camera.width) &&
      (y + halfHeight >= 0 && y - halfHeight <= camera.height)
  }

  protected onFrameLoadedCallbacks: CallbackHandleCollection<[number]> =
    new CallbackHandleCollection<[number]>()

  /**
   * Triggers event with origin-based frame index.
   *
   * @param cb
   * @returns
   */
  public onFrameLoaded (cb: (frameIndex: number) => void): CallbackHandle {
    return this.onFrameLoadedCallbacks.add(cb)
  }

  public hitTarget (event: CanvasEvent): boolean {
    return this.layers.some((layer) => event.target === layer.canvas)
  }

  public isViewsAnnotation (annotation: StageAnnotation): boolean {
    if (this.isDicomItem && this.loadedVideo) {
      if (!this.framesIndexes.length) { return false }

      if (!('segments' in annotation.data)) { return false }

      return !!annotation.data.segments?.find(
        (range: [number, number]) => {
          return range[0] >= this.firstFrameIndex &&
          range[1] <= this.lastFrameIndex + 1
        }
      )
    }

    return true
  }
}
