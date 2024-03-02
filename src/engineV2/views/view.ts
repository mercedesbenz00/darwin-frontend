import { EventEmitter } from 'events'

import { v4 as uuidv4 } from 'uuid'

import { euclideanDistance } from '@/engineCommon/algebra'
import { AutoAnnotateInferencePayload, InferenceData, isClickerData } from '@/engineCommon/backend'
import { CallbackHandle, CallbackHandleCollection } from '@/engineCommon/callbackHandler'
import { Camera } from '@/engineCommon/camera'
import { getZoomWindow } from '@/engineCommon/getZoomWindow'
import {
  DEFAULT_IMAGE_MANIPULATION_FILTER,
  ImageManipulationFilter,
  WindowLevels
} from '@/engineCommon/imageManipulation'
import {
  EditableImagePoint,
  ImagePoint,
  Point,
  pointInPath,
  pointIsVertexOfPath,
  pointOnPath
} from '@/engineCommon/point'
import { createKeyframeAction, deleteKeyframeAction } from '@/engineV2/actions'
import { Editor } from '@/engineV2/editor'
import {
  ActionManager,
  AnnotationManager,
  RasterManager,
  CommentManager,
  FileManager,
  ItemManager,
  MeasureManager,
  OverlayManager,
  RenderManager,
  ToolManager
} from '@/engineV2/managers'
import { FeatureFlagsManager } from '@/engineV2/managers/featureFlagsManager'
import {
  Annotation,
  AnnotationData,
  Object2D,
  Layer,
  RasterLayer,
  HTMLLayer,
  Raster,
  ObjectHTML,
  OptimisedLayer
} from '@/engineV2/models'
import { DrawFn, ILayer } from '@/engineV2/models/layers/types'
import {
  BBox,
  getWindowLevelsRange,
  getCSSFilterString
} from '@/engineV2/utils'
import runInference from '@/store/modules/workview/actions/runInference'
import {
  RenderableImage,
  StageAnnotation
} from '@/store/modules/workview/types'
import {
  RESET_ZOOM_MODE,
  RunningSessionPayload,
  StoreActionPayload,
  StoreActionResponse,
} from '@/store/types'
import { V2DatasetItemPayload } from '@/store/types/V2DatasetItemPayload'
import { V2DatasetItemSlot } from '@/store/types/V2DatasetItemSlot'
import { getFileExtension } from '@/utils'
import { CanvasEvent } from '@/utils/touch'

const NO_OVERLAY_TYPES = ['string']

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

/**
 * @event currentFrameIndex:changed
 * @property {number} currentFrameIndex
 * @event readonly:changed
 */
export abstract class View extends EventEmitter {
  private _readonly: boolean = false
  public get readonly (): boolean { return this._readonly }

  public set readonly (state: boolean) {
    this._readonly = state
    this.emit('readonly:changed', this._readonly)
  }

  private _showFramesTool: boolean = false
  public get showFramesTool (): boolean {
    return this._showFramesTool
  }

  public set showFramesTool (state: boolean) {
    this._showFramesTool = state
    this.editor.emit('showFramesTool:changed', this._showFramesTool)
  }

  public id: string

  protected static RERENDER_LIMIT = 50

  /**
   * Keeps views loading state.
   *
   * @event loading:changed
   * @property {boolean} isLoading - Views loading state.
   */
  private _loading: boolean = false
  get loading (): boolean {
    return this._loading
  }

  set loading (state: boolean) {
    this._loading = state
    this.emit('loading:changed', this._loading)
  }

  /**
   * Main layer - renders image/video on the screen.
   *
   * Only zoom, panning, and image filter update
   * will trigger its re-render.
   */
  public mainLayer: ILayer
  /**
   * Annotations layer - renders annotations, comments, inferenceData items.
   */
  public annotationsLayer: ILayer
  /**
   * Annotations overlays layer - renders overlays related to annotations.
   */
  public annotationsOverlayLayer: HTMLLayer
  /**
   * Experimental Annotations layer - renders annotations, comments, inferenceData items.
   * Currently requires the RASTERS feature flag to be enabled.
   */
  public rasterAnnotationLayer?: RasterLayer

  public commentLayer: ILayer

  public imageFilter: ImageManipulationFilter = DEFAULT_IMAGE_MANIPULATION_FILTER

  public camera = new Camera()

  public measureManager: MeasureManager
  public annotationManager: AnnotationManager
  public rasterManager?: RasterManager // Currently requires the RASTERS feature flag to be enabled.
  public overlayManager: OverlayManager
  public commentManager: CommentManager
  public renderManager: RenderManager
  public fileManager: FileManager

  private _showPills: boolean = true
  get showPills (): boolean {
    return this._showPills
  }

  set showPills (value: boolean) {
    this._showPills = value
  }

  protected onCleanup: Function[] = []

  private _currentFrame: RenderableImage | null = null
  public get currentFrame (): RenderableImage | null {
    return this._currentFrame
  }

  protected set currentFrame (frame: RenderableImage | null) {
    this._currentFrame = frame

    this.mainLayer.changed()
  }

  private _currentFrameIndex: number = 0
  public get currentFrameIndex (): number {
    return this._currentFrameIndex
  }

  protected set currentFrameIndex (value: number) {
    this._currentFrameIndex = value
    this.emit('currentFrameIndex:changed', this._currentFrameIndex)

    this.setAnnotations()
    this.setCommentThreads()
  }

  protected framesIndexes: number[] = [0]

  constructor (public editor: Editor, file: V2DatasetItemSlot, item: V2DatasetItemPayload) {
    super()

    this.id = uuidv4()
    this.editor = editor

    if (FeatureFlagsManager.isOnLayerV2) {
      this.annotationsLayer = new OptimisedLayer(this.camera)
    } else {
      this.annotationsLayer = new Layer(this.camera)
    }

    this.mainLayer = new Layer(this.camera)
    this.commentLayer = new Layer(this.camera)
    this.annotationsOverlayLayer = new HTMLLayer()

    this.measureManager = new MeasureManager(this)
    this.annotationManager = new AnnotationManager(this)
    this.fileManager = new FileManager(this, file, item)
    this.overlayManager = new OverlayManager(this)
    this.commentManager = new CommentManager(this)
    this.renderManager = new RenderManager(this)

    if (FeatureFlagsManager.isOnRasters) {
      this.rasterManager = new RasterManager(this)

      const getMaskAnnotationForRaster = (
        raster: Raster,
        annotationId: string
      ): Annotation | undefined => {
        // Check the annotation manager
        const annotation = this.annotationManager.getAnnotation(annotationId)

        if (annotation) {
          return annotation
        }

        // Fallback to checking if we have a temporary in progress annotation
        // (e.g. during a brush stroke for an as-of-yet uncreated mask annotation)
        return raster.getInProgressAnnotation(annotationId)
      }

      const renderRasterCallback = (
        rasterId: string,
        annotationIdsInRaster: string[],
      ): void => {
        // TODO -> No need to cast this once we remove the feature flag and make
        // The raster layer non-optional.
        const rasterManager = <RasterManager>this.rasterManager
        const raster = rasterManager.getRaster(rasterId)

        if (raster === undefined) {
          throw new Error('Entering render for undefined raster, this should not happen.')
        }

        const annotations: Annotation[] = []

        let annotationNotFound = false

        // Get annotations required for colors, etc
        annotationIdsInRaster.forEach(annotationId => {
          const annotation = getMaskAnnotationForRaster(raster, annotationId)

          if (annotation) {
            annotations.push(annotation)
          } else {
            annotationNotFound = true
          }
        })

        if (annotationNotFound) {
          // This can occur on loading before annotations are initialised.
          // The annotation should appear soon and cause a re-render next frame.
          return
        }

        this.renderManager.renderRaster(
          this,
          <ILayer>this.rasterAnnotationLayer,
          raster,
          annotations
        )
      }

      this.rasterAnnotationLayer = new RasterLayer(
        this.camera,
        this.rasterManager,
        renderRasterCallback
      )
    }

    this.addPermanentListeners()

    const onBeforeRender = (canvas: HTMLCanvasElement): void => {
      canvas.width = this.camera.width
      canvas.height = this.camera.height
    }

    this.onCleanup.push(
      this.mainLayer.onBeforeRender(
        (ctx, canvas) => onBeforeRender(canvas)
      ).release
    )

    this.onCleanup.push(
      this.annotationsLayer.onBeforeRender(
        (ctx, canvas) => onBeforeRender(canvas)
      ).release
    )

    this.onCleanup.push(
      this.commentLayer.onBeforeRender(
        (ctx, canvas) => onBeforeRender(canvas)
      ).release
    )

    if (FeatureFlagsManager.isOnRasters && this.rasterAnnotationLayer !== undefined) {
      this.onCleanup.push(
        this.rasterAnnotationLayer.onBeforeRender(
          (ctx, canvas) => onBeforeRender(canvas)
        ).release
      )
    }

    const onRender = (): void => {
      this.renderManager.emitRenderCallbacks(this)

      if (FeatureFlagsManager.isOnLayerV2) {
        if (this.store.state.workview.renderSubAnnotations) {
          this.annotationsOverlayLayer.changed()
        }
        if (this.store.state.workview.renderMeasures && !!this.measureManager.measureRegion) {
          this.measureManager.reset()
        }
      } else {
        this.annotationsOverlayLayer.changed()
      }
    }

    this.onCleanup.push(
      this.mainLayer.onRender(() => onRender()).release
    )

    this.onCleanup.push(
      this.annotationsLayer.onRender(() => onRender()).release
    )

    this.onCleanup.push(
      this.commentLayer.onRender(() => onRender()).release
    )

    if (FeatureFlagsManager.isOnRasters && this.rasterAnnotationLayer !== undefined) {
      this.rasterAnnotationLayer.onRender(() => onRender()).release
    }

    const handleAnnotationsChanged = (): void => {
      // Redefine Views annotations items
      this.setAnnotations()
      this.overlayManager.reset()
      this.measureManager.reset()
      if (FeatureFlagsManager.isOffLayerV2) {
        this.annotationsLayer.changed()
        this.annotationsOverlayLayer.changed()
      }

      if (FeatureFlagsManager.isOnRasters && this.rasterAnnotationLayer !== undefined) {
        this.rasterAnnotationLayer.changed()
      }
    }

    this.annotationManager.on('annotations:changed', handleAnnotationsChanged)
    this.onCleanup.push(() =>
      this.annotationManager.off('annotations:changed', handleAnnotationsChanged)
    )

    if (FeatureFlagsManager.isOnLayerV2) {
      const handleAnnotationUpdate = (annotation: Annotation): void => {
        this.annotationsLayer.update(annotation.id)
      }

      this.annotationManager.on('annotation:update', handleAnnotationUpdate)
      this.onCleanup.push(() =>
        this.annotationManager.off('annotation:update', handleAnnotationUpdate)
      )

      const handleAnnotationCreate = (annotation: Annotation): void => {
        const annotationId = annotation.id

        annotation.clearCache()

        this.annotationsLayer.add(this.createAnnotationObject2D(annotationId))
        this.annotationsOverlayLayer.add(
          this.createAnnotationOverlay(annotationId, NO_OVERLAY_TYPES)
        )
      }

      this.annotationManager.on('annotation:create', handleAnnotationCreate)
      this.onCleanup.push(() =>
        this.annotationManager.off('annotation:create', handleAnnotationCreate)
      )

      const handleAnnotationDelete = (annotation: Annotation): void => {
        this.annotationsLayer.delete(annotation.id)
        this.annotationsOverlayLayer.delete(`overlay_${annotation.id}`)
        this.measureManager.removeOverlayForAnnotation(annotation.id)
        this.overlayManager.removeOverlayForAnnotation(annotation.id)
      }

      this.annotationManager.on('annotation:delete', handleAnnotationDelete)
      this.onCleanup.push(() =>
        this.annotationManager.off('annotation:delete', handleAnnotationDelete)
      )
    }
    const handleCommentsChanged = (): void => {
      this.setCommentThreads()
    }

    this.commentManager.on(CommentManager.THREADS_CHANGED, handleCommentsChanged)
    this.onCleanup.push(() =>
      this.commentManager.off(CommentManager.THREADS_CHANGED, handleCommentsChanged)
    )

    const handleFileLoading = (): void => {
      this.loading = true
    }
    this.fileManager.on('file:loading', handleFileLoading)
    this.onCleanup.push(() =>
      this.fileManager.off('file:loading', handleFileLoading)
    )

    const handleFileLoaded = (): void => {
      this.loading = false
      this.init()
    }
    this.fileManager.on('file:loaded', handleFileLoaded)
    this.onCleanup.push(() =>
      this.fileManager.off('file:loaded', handleFileLoaded)
    )
  }

  get isLoading (): boolean {
    return this.loading
  }

  get isLoaded (): boolean {
    return !this.loading
  }

  get width (): number {
    return this.mainLayer.canvas.width
  }

  get height (): number {
    return this.mainLayer.canvas.height
  }

  abstract init (): void

  get firstFrameIndex (): number {
    return this.framesIndexes[0] || 0
  }

  get lastFrameIndex (): number {
    return this.framesIndexes[this.framesIndexes.length - 1] || 0
  }

  get totalFrames (): number {
    return this.fileManager.totalSections
  }

  get currentViewSize (): { width: number, height: number} | null {
    return this.currentFrame?.data || null
  }

  public isFrameIndexRelatedToView (index: number): boolean {
    if (!this.framesIndexes.length) { return false }
    return this.firstFrameIndex <= index && this.lastFrameIndex >= index
  }

  public render (): void {
    this.layers.forEach(layer => {
      layer.render()
    })
  }

  get itemManager (): ItemManager {
    return this.editor.itemManager
  }

  get toolManager (): ToolManager {
    return this.editor.toolManager
  }

  get actionManager (): ActionManager {
    return this.editor.actionManager
  }

  get layers (): ILayer[] {
    const layers = [
      this.mainLayer,
      this.annotationsLayer,
      this.annotationsOverlayLayer,
      this.commentLayer
    ]

    if (FeatureFlagsManager.isOnRasters && this.rasterAnnotationLayer !== undefined) {
      layers.push(this.rasterAnnotationLayer)
    }

    return layers
  }

  public allLayersChanged (): void {
    this.layers.forEach(layer => layer.changed())
  }

  get canvasContainer (): DocumentFragment {
    const documentFragment = document.createDocumentFragment()
    this.layers.forEach(layer => {
      documentFragment.appendChild(layer.element)
    })

    return documentFragment
  }

  get isActive (): boolean {
    return this === this.editor.layout.activeView
  }

  /**
   * Max/Min Window levels range of the current file
   */
  get windowLevelsRange (): WindowLevels {
    const { isLoaded } = this
    const { metadata } = this.fileManager

    if (isLoaded) {
      return getWindowLevelsRange(metadata?.colorspace)
    }

    return getWindowLevelsRange()
  }

  /**
   * Default window levels value of the current file
   */
  get defaultWindowLevels (): WindowLevels {
    const { isLoaded } = this
    const { metadata } = this.fileManager

    if (isLoaded) {
      return getWindowLevelsRange(
        metadata?.colorspace,
        metadata?.default_window
      )
    }

    return getWindowLevelsRange()
  }

  get defaultImageSmoothing (): boolean {
    if (!this.fileManager.filename) { return false }

    const { filename } = this.fileManager
    const fileExtension = getFileExtension(filename)
    const userValue = window.localStorage.getItem(`isImageSmoothing:${fileExtension}`)
    if (userValue) {
      return userValue === 'on'
    }

    return ['dcm', 'dicom', 'svs', 'pdf', 'tiff'].includes(fileExtension)
  }

  get cameraScale (): number {
    return this.camera.scale
  }

  public updateCameraDimensions (width?: number, height?: number): void {
    this.camera.setWidth(width || this.mainLayer.canvas.clientWidth)
    this.camera.setHeight(height || this.mainLayer.canvas.clientHeight)
  }

  public zoomTo (topLeft: Point<'Image'>, bottomRight: Point<'Image'>): void {
    if (!(
      Number.isFinite(topLeft.x) && Number.isFinite(topLeft.y) &&
      Number.isFinite(bottomRight.x) && Number.isFinite(bottomRight.y)
    )) { return }

    this.allLayersChanged()
    this.camera.zoomToBox(
      this.camera.imageViewToCanvasView(topLeft),
      this.camera.imageViewToCanvasView(bottomRight)
    )
  }

  public scaleToFit (): void {
    this.camera.scaleToFit()
    this.allLayersChanged()
  }

  public zoomToAnnotation (annotation: Annotation): void {
    const { type } = annotation
    const renderer = this.renderManager.rendererFor(type)
    if (!renderer || !('getAllVertices' in renderer)) { return }

    const vertices = renderer.getAllVertices(annotation, this)
    if (vertices.length === 0) { return }

    const { width, height } = this.camera.image
    const { topLeft, bottomRight } = getZoomWindow(vertices, width, height, 0.1)

    this.zoomTo(topLeft, bottomRight)
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

    this.emit('imageFilter:changed', this.imageFilter)

    this.allLayersChanged()
  }

  /**
   * Fast jumpToFrame using lq images only
   *
   * @param {number} frameIndex
   * @returns
   */
  async lqJumpToFrame (frameIndex: number): Promise<void> {
    this.currentFrameIndex = frameIndex

    if (!this.fileManager.isFrameLoaded(this.currentFrameIndex)) {
      this.loading = true
    }

    const lqFrame = await this.fileManager.getLQFrame(
      this.currentFrameIndex,
      { fallbackHQFrame: true }
    )

    if (!lqFrame) { return }

    this.currentFrame = lqFrame
    this.loading = false

    // jumping between frames changes subAnnotation content so the redraw option is enabled
    this.annotationManager.invalidateAnnotationCache()
    this.commentManager.deselectCommentThread()

    this.allLayersChanged()
  }

  /**
   * Sets active frame by index
   * @param frameIndex - counter start from 0
   * @param resetZoom
   * @returns
   */
  async jumpToFrame (frameIndex: number, resetZoom: boolean = false): Promise<void> {
    if (frameIndex < this.firstFrameIndex || frameIndex > this.lastFrameIndex) { return }

    if (this.fileManager.isTiled) { return }
    // TODO: FOr dicom or pdf load only HQ
    let shouldResetZoom = resetZoom

    this.currentFrameIndex = frameIndex

    if (this.fileManager.isHQFrameLoaded(frameIndex)) {
      this.loading = false
      this.currentFrame = await this.fileManager.getHQFrame(this.currentFrameIndex)
      return
    }

    if (!this.fileManager.isFrameLoaded(frameIndex)) {
      this.loading = true
    }

    try {
      const lqFrame = await this.fileManager.loadFramesFrom(frameIndex)

      if (lqFrame && this.currentFrameIndex === frameIndex) {
        this.currentFrame = lqFrame
        this.camera.setImage(lqFrame.data, resetZoom)

        if (shouldResetZoom) {
          shouldResetZoom = false
          this.scaleToFit()
        }

        // jumping between frames changes subAnnotation content so the redraw option is enabled
        this.annotationManager.invalidateAnnotationCache()
        this.commentManager.deselectCommentThread()

        this.loading = false
      }
    } catch (e: unknown) {
      console.error(e)
    }

    this.fileManager.getHQFrame(frameIndex).then(hqFrame => {
      if (!hqFrame) { return }

      if (this.currentFrameIndex === frameIndex) {
        this.currentFrame = hqFrame
        this.camera.setImage(hqFrame.data, resetZoom)

        if (shouldResetZoom) {
          shouldResetZoom = false
          this.scaleToFit()
        }

        // jumping between frames changes subAnnotation content so the redraw option is enabled
        this.annotationManager.invalidateAnnotationCache()
        this.commentManager.deselectCommentThread()
      }
      this.loading = false
    }).catch(() => {
      this.loading = false
    })
  }

  public isFramesAnnotation (annotation: StageAnnotation): boolean {
    if (!('segments' in annotation.data)) { return true }

    return annotation.data.segments?.some((range: [number, number]) => {
      return range[0] <= this.currentFrameIndex &&
        range[1] >= this.currentFrameIndex + 1
    }) || true
  }

  public isViewsAnnotation (annotation: StageAnnotation): boolean {
    const { slotName } = this.fileManager

    if (!annotation.context_keys) {
      return true
    }

    return !!annotation.context_keys?.slot_names?.includes(slotName)
  }

  public isViewsSlot (slotName: string): boolean {
    return this.fileManager.slotName === slotName
  }

  // TODO
  get store (): typeof this.editor.store {
    return this.editor.store
  }

  // TODO
  protected setAnnotations (): void {
    this.annotationsLayer.clear()
    this.annotationsOverlayLayer.clear()
    // It returns sorted array
    // Upper first. So need to reverse.
    // mainAnnotations returns new filtered array
    // so it's ok to reverse it in place.
    const objects = this.annotationManager.annotations
      .slice()
      .reverse()
      .map((annotation: Annotation) => {
        this.setAnnotation(annotation, NO_OVERLAY_TYPES)

        return this.createAnnotationObject2D(annotation.id)
      })

    this.annotationsLayer.add(objects)

  }

  protected createAnnotationObject2D (annotationId: Annotation['id']): Object2D {
    return new Object2D(
      annotationId,
      (ctx, canvas, drawFn) => {
        const annotation = this.annotationManager.getAnnotation(annotationId)
        if (!annotation) {
          this.annotationsOverlayLayer.delete(annotationId)
          return
        }

        if (!annotation.isVisible) {
          this.measureManager.removeOverlayForAnnotation(annotation.id)
          this.overlayManager.removeOverlayForAnnotation(annotation.id)
          return
        }

        if (drawFn && FeatureFlagsManager.isOnLayerV2) {
          this.renderManager.renderSubAnnotations(drawFn, this, this.annotationsLayer, annotation)
          this.renderManager.renderAnnotation(
            drawFn,
            this,
            this.annotationsLayer,
            annotation,
            undefined,
            false
          )
        } else {
          const draw = (drawFn?: DrawFn): void => {
            ctx.save()
            drawFn?.(ctx, canvas)
            ctx.restore()
          }

          this.renderManager.renderSubAnnotations(draw, this, this.annotationsLayer, annotation)
          this.renderManager.renderAnnotation(
            draw,
            this,
            this.annotationsLayer,
            annotation,
            undefined,
            false
          )
        }
      },
      () => {
        const annotation = this.annotationManager.getAnnotation(annotationId)
        if (!annotation) { throw new Error("Can't get annotation!") }

        return annotation.getOriginBBox(this)
      },
      (point: ImagePoint) => {
        const annotation = this.annotationManager.getAnnotation(annotationId)
        if (!annotation) { throw new Error("Can't get annotation!") }

        const { type } = annotation
        const renderer = this.renderManager.rendererFor(type)

        if (!renderer || !('containsPoint' in renderer)) { return false }

        if (renderer.containsPoint(annotation, point)) {
          return true
        }

        return annotation.isSelected && pointIsVertexOfPath(
          point,
          renderer.getAllVertices(annotation, this),
          5 / this.cameraScale
        )
      },
      () => {
        const annotation = this.annotationManager.getAnnotation(annotationId)
        if (!annotation) { throw new Error("Can't get annotation!") }

        return annotation.zIndex
      }
    )
  }

  protected createAnnotationOverlay (
    annotationId: Annotation['id'],
    noOverlayTypes: string[]
  ): ObjectHTML {
    return new ObjectHTML(
      `overlay_${annotationId}`,
      () => {
        const annotation = this.annotationManager.getAnnotation(annotationId)
        if (!annotation) {
          this.annotationsOverlayLayer.delete(annotationId)
          return
        }

        if (!annotation.isVisible || noOverlayTypes.includes(annotation.type)) { return }
        if (!this.isInViewport(annotation)) {
          this.overlayManager.removeOverlayForAnnotation(annotation.id)
          return
        }

        let actualAnnotation = annotation
        if (annotation.isVideoAnnotation()) {
          const { data: annotationData } = annotation.inferVideoData(this)
          if (Object.keys(annotationData).length === 0) {
            this.overlayManager.removeOverlayForAnnotation(annotation.id)
            return
          }
          actualAnnotation = annotation.shallowClone({ data: annotationData })
        }

        const { currentTool } = this.editor.toolManager
        if (currentTool?.tool?.shouldRender && !currentTool.tool.shouldRender(actualAnnotation)) {
          this.overlayManager.removeOverlayForAnnotation(annotation.id)
          return
        }

        this.overlayManager.updateOverlayForAnnotation(annotation)

        return undefined
      }
    )
  }

  protected setAnnotation (annotation: Annotation, noOverlayTypes: string[]): void {
    annotation.clearCache()

    if (FeatureFlagsManager.isOnRasters && annotation.type == 'mask') {
      this.addAnnotation(annotation)
    }

    this.annotationsOverlayLayer.add(
      this.createAnnotationOverlay(annotation.id, noOverlayTypes)
    )
  }

  private addAnnotation (annotation: Annotation): void {
    // TODO -> This feels like a bit of a hack of the current architecture,
    // I think we should eventually more concretely seperate out semantic vs instance
    // annotations.

    if (annotation.type == 'mask') {
      if (this.rasterAnnotationLayer === undefined) {
        throw new Error('rasterAnnotationLayer is not initialised.')
      }

      const layer = this.rasterAnnotationLayer

      // Add sub annotation rendering =>
      // TODO We don't support this yet, but its here for when we need it.
      layer.add(new Object2D(
        annotation.id,
        () => {
          if (!annotation.isVisible) {
            this.measureManager.removeOverlayForAnnotation(annotation.id)
            this.overlayManager.removeOverlayForAnnotation(annotation.id)
            return
          }

          this.renderManager.renderSubAnnotations(() => {}, this, layer, annotation)
        }
      ))

      // Get the annotation from the video, to get the raster reference.

      let annotationData

      if (annotation.isVideoAnnotation()) {
        const { data } = annotation.inferVideoData(this)

        annotationData = data
      } else {
        annotationData = <AnnotationData>annotation.data
      }

      if (annotationData.rasterId === undefined) {
        throw new Error('Mask annotation has no referenced rasterId.')
      }

      layer.addRaster(annotationData.rasterId)
    } else {
      const layer = this.annotationsLayer

      layer.add(new Object2D(
        annotation.id,
        () => {
          if (!annotation.isVisible) {
            this.measureManager.removeOverlayForAnnotation(annotation.id)
            this.overlayManager.removeOverlayForAnnotation(annotation.id)
            return
          }

          this.renderManager.renderSubAnnotations(() => {}, this, layer, annotation)
          this.renderManager.renderAnnotation(() => {}, this, layer, annotation, undefined, false)
        }
      ))
    }
  }

  public setCommentThreads (): void {
    this.commentLayer.clear()
    this.commentManager.threads.forEach(t => {
      const renderable = new Object2D(t.id, (ctx, canvas, drawFn) =>
        this.renderManager.renderComment(drawFn, this, t)
      )
      this.commentLayer.add(renderable)
    })
  }

  // TODO
  isPointOnPath (point: ImagePoint, path: EditableImagePoint[]): boolean {
    return pointOnPath(point, path, 5 / this.cameraScale)
  }

  // TODO
  isPointOnPaths (point: ImagePoint, paths: EditableImagePoint[][]): boolean {
    return paths.some(p => this.isPointOnPath(point, p))
  }

  // TODO
  isPointInPath (point: ImagePoint, path: EditableImagePoint[]): boolean {
    return (pointIsVertexOfPath(point, path, 5 / this.cameraScale) || pointInPath(point, path))
  }

  // TODO
  isPointInPath2D (path2D: Path2D, point: ImagePoint): boolean {
    const ctx = this.annotationsLayer.context
    if (!ctx) { return false }
    return ctx.isPointInPath(path2D, point.x, point.y, 'evenodd')
  }

  // TODO
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

  // TODO
  public isFrameIndexValid (frameIndex: number): boolean {
    console.info(frameIndex)
    // if (!this.loadedVideo) { return false }
    // return frameIndex >= 0 && frameIndex < this.totalFrames
    return false
  }

  // TODO
  get isResetZoom (): boolean {
    return this.store.state.workview.resetZoomMode === RESET_ZOOM_MODE.RESET
  }

  // TODO
  async runInference (
    runningSessionId: string,
    data: InferenceData | AutoAnnotateInferencePayload
  ) {
    const payload: StoreActionPayload<typeof runInference> = {
      data: data as any,
      runningSessionId
    }

    const response: StoreActionResponse<typeof runInference> =
      await this.store.dispatch('workview/runInference', payload)

    if ('error' in response) {
      this.store.dispatch('toast/warning', { content: response.error.message })
    }

    const isFirstSend = isClickerData(data) && data.data.clicks.length === 0
    if ('data' in response && isFirstSend) {
      this.store.dispatch('workviewTracker/reportAutomationAction')
    }

    return response
  }

  // TODO
  createKeyFrame (annotation: Annotation | null, frameIndex: number): void {
    if (!annotation || !annotation.isVideoAnnotation()) { return }
    if (!this.isFrameIndexValid(frameIndex)) { return }

    const action = createKeyframeAction(this.editor.activeView, annotation, frameIndex)
    this.actionManager.do(action)
  }

  // TODO
  deleteKeyFrame (annotation: Annotation | null, key: number | null): void {
    if (!annotation || !key) { return }

    const action = deleteKeyframeAction(this.editor.activeView, annotation, key)
    this.actionManager.do(action)
  }

  // TODO
  public disableAnnotationOverlays (): void {
    this.store.commit('workview/SET_ANNOTATION_OVERLAY_DISABLED', true)
  }

  // TODO
  public enableAnnotationOverlays (): void {
    this.store.commit('workview/SET_ANNOTATION_OVERLAY_DISABLED', false)
  }

  // TODO
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

  // TODO
  /**
   * Add a component to be rendered outside canvas
   */
  public addComponent (params: { id: string, name: string, props: any }): void {
    const { id, name, props } = params
    const index = this.components.findIndex(c => c.id === id)
    if (index === -1) { this.components.push({ id, name, props }) }
  }

  // TODO
  /**
   * Remove an existing component by specified id
   */
  public removeComponent (id: string): void {
    const index = this.components.findIndex(c => c.id === id)
    if (index > -1) { this.components.splice(index, 1) }
  }

  // TODO
  unhighlightAllVertices (): void {
    this.annotationManager.unhighlightAllAnnotationsVertices()
    this.commentManager.unhighlightCommentThread()
  }

  // TODO
  deselectAllVertices (): void {
    this.annotationManager.deselectAllAnnotationsVertices()
  }

  // TODO
  unhighlightAll (): void {
    this.annotationManager.unhighlightAllAnnotations()
    this.commentManager.unhighlightCommentThread()
  }

  // TODO
  deselectAll (): void {
    this.annotationManager.deselectAllAnnotations()
    this.commentManager.deselectCommentThread()
  }

  // comments

  // TODO
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

  // TODO
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

  // TODO
  readonly permanentListenersKeys: string[] = ['mousemove']

  // TODO
  private addPermanentListeners (): void {
    const target = this.editor.embedded ? this.annotationsLayer.canvas : window.document.body
    Object.keys(this.canvasListeners)
      .filter(key => this.permanentListenersKeys.includes(key))
      .forEach(key => addListener(target, [key, this.canvasListeners[key]]))
  }

  // TODO
  public addListeners (): void {
    const target = this.editor.embedded ? this.annotationsLayer.canvas : window.document.body
    Object.keys(this.canvasListeners)
      .filter(key => !this.permanentListenersKeys.includes(key))
      .forEach(key => addListener(target, [key, this.canvasListeners[key]]))
  }

  // TODO
  public removeListeners (includePermanent?: boolean): void {
    const target = this.editor.embedded ? this.annotationsLayer.canvas : window.document.body

    let listenersKeys = Object.keys(this.canvasListeners)

    if (!includePermanent) {
      listenersKeys = listenersKeys.filter(key => !this.permanentListenersKeys.includes(key))
    }

    listenersKeys.forEach(key => removeListener(target, [key, this.canvasListeners[key]]))
  }

  // TODO
  public cleanup (): void {
    this.layers.forEach(layer => {
      layer.destroy()
    })
    this.fileManager.cleanup()
    this.renderManager.cleanup()
    this.overlayManager.cleanup()
    this.removeListeners(true)
    this.annotationManager.cleanup()
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
    this.onCleanup.forEach(callback => callback())
    this.onCleanup = []
  }

  // TODO
  /**
   * Prepares instance to release the memory
   */
  public destroy (): void {
    this.cleanup()
  }

  // TODO
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

  // TODO
  public hitTarget (event: CanvasEvent): boolean {
    return this.layers.some((layer) => event.target === layer.canvas)
  }
}
