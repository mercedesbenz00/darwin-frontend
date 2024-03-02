import { CallbackHandle, CallbackHandleCollection } from '@/engineCommon/callbackHandler'
import { Camera } from '@/engineCommon/camera'
import { ImageManipulationFilter, WindowLevels } from '@/engineCommon/imageManipulation'
import { ImagePoint, Point } from '@/engineCommon/point'
import { Rectangle } from '@/engineCommon/rectangle'
import { EditorCommentThread } from '@/engineV2/commentHelpers'
import { drawDashedBox } from '@/engineV2/graphics'
import {
  Annotation,
  LoadedImageWithTiles,
  AnnotationTypeRenderer,
  MainAnnotationTypeRenderer,
  RasterTypeRenderer,
  isVideoSubAnnotations,
  Raster
} from '@/engineV2/models'
import { ILayer, DrawCallback } from '@/engineV2/models/layers/types'
import { isRenderableImage, Tile } from '@/engineV2/models/tiler'
import {
  generateHistogramData,
  resolveTransformedImageData,
  resolveDicomTransformedImageData,
  windowFunction
} from '@/engineV2/utils'
import { StreamView, View } from '@/engineV2/views'
import { RenderableImage } from '@/store/modules/workview/types'
import { DatasetVideoMetadata } from '@/store/types'

/**
 * Type guard to ensure the specified renderer is a MainAnnotationTypeRenderer
 */
export const isMainAnnotationTypeRenderer = (
  r: AnnotationTypeRenderer | undefined
): r is MainAnnotationTypeRenderer =>
  !!r && ('moveVertex' in r) && ('getAllVertices' in r) && ('translate' in r)

/**
 * Type guard to ensure the specified renderer
 * is a MainAnnotationTypeRenderer supporting interpolation
 */
export const supportsInterpolation = (r: AnnotationTypeRenderer | undefined):
  r is MainAnnotationTypeRenderer & {
    interpolate: Exclude<MainAnnotationTypeRenderer['interpolate'], undefined>
  } =>
  isMainAnnotationTypeRenderer(r) && !!r.supportsInterpolate

export const enableInterpolateByDefault = (r: AnnotationTypeRenderer | undefined):
  r is MainAnnotationTypeRenderer & {
    interpolate: Exclude<MainAnnotationTypeRenderer['interpolate'], undefined>
  } =>
  isMainAnnotationTypeRenderer(r) && !!r.enableInterpolateByDefault

export class RenderManager {
  private onRenderCallbacks: CallbackHandleCollection<[View]> =
    new CallbackHandleCollection<[View]>()

  private annotationRenderer = new Map<string, AnnotationTypeRenderer>()
  private rasterRenderer = new Map<string, RasterTypeRenderer>()
  private windowLevels: WindowLevels | null = null
  private isImageSmoothing: boolean = false
  public editSubAnnotations: boolean = true
  public scale: number = 1

  private view: View

  constructor (view: View) {
    this.view = view
  }

  // rendering sub annotations is determined by a flag in the workview store.
  // this additional flag on the renderer allows certain calls to override the store flag
  public shouldForceHideSubAnnotations = false;

  static imageFilterToString (filter: ImageManipulationFilter): string {
    let filterString = ''

    if (filter.colorMap !== 'default') {
      /**
       * Sets color map filter using ColorMaps.vue
       * by its id
       */
      filterString += ` url(#color-map_${filter.colorMap})`
    }

    return filterString.trim() || 'none'
  }

  static drawImageOnCanvas (
    view: View,
    canvas: HTMLCanvasElement,
    image: RenderableImage
  ): boolean {
    // clicker provide tmp canvas so we need to set its size here.
    canvas.width = view.camera.width
    canvas.height = view.camera.height
    const ctx = canvas.getContext('2d')
    if (!ctx) { return false }

    ctx.clearRect(0, 0, view.camera.width, view.camera.height)
    if (!image.data) { return false }

    // 'default' color map is hardcoded here, since we no longer apply
    // it this way and instead use a css filter.
    const transformedData = resolveTransformedImageData(
      image,
      view.imageFilter.windowLevels,
      'default',
      null
    )
    if (!transformedData) { return false }
    ctx.imageSmoothingEnabled = view.imageFilter.isImageSmoothing
    const [dx, dy, dw, dh] = view.camera.drawImageParams(image.data)
    ctx.filter = RenderManager.imageFilterToString(view.imageFilter)
    ctx.drawImage(transformedData, dx, dy, dw, dh)
    ctx.filter = 'none'
    ctx.imageSmoothingEnabled = true

    if (view.measureManager.showMeasures) {
      this.renderMeasureRegion(view)
    }

    return true
  }

  static drawDicomImageOnCanvas (
    view: View,
    canvas: HTMLCanvasElement,
    image: RenderableImage,
    videoMetadata: DatasetVideoMetadata | null
  ): boolean {
    // clicker provide tmp canvas so we need to set its size here.
    canvas.width = view.camera.width
    canvas.height = view.camera.height
    const ctx = canvas.getContext('2d')
    if (!ctx) { return false }

    ctx.clearRect(0, 0, view.camera.width, view.camera.height)
    if (!image.data) { return false }

    // 'default' color map is hardcoded here, since we no longer apply
    // it this way and instead use a css filter.
    const transformedData = resolveDicomTransformedImageData(
      image,
      view.imageFilter.windowLevels,
      'default',
      {
        ...videoMetadata,
        type: 'dicom'
      }
    )
    if (!transformedData) { return false }
    ctx.imageSmoothingEnabled = view.imageFilter.isImageSmoothing
    const [dx, dy, dw, dh] = view.camera.drawImageParams(image.data)
    ctx.filter = RenderManager.imageFilterToString(view.imageFilter)
    ctx.drawImage(transformedData, dx, dy, dw, dh)
    ctx.filter = 'none'
    ctx.imageSmoothingEnabled = true

    if (view.measureManager.showMeasures) {
      this.renderMeasureRegion(view)
    }

    return true
  }

  /**
   * Duplicates frame from Video inside the canvas
   * to support annotations render.
   *
   * @param view
   * @returns
   */
  public static renderHTMLVideo (
    view: StreamView,
    canvas: HTMLCanvasElement
  ): void {
    const ctx = canvas.getContext('2d')

    if (!ctx) { return }
    if (!view.video) { return }

    const HAVE_NOTHING = 0
    if (view.video.readyState === HAVE_NOTHING) { return }

    const { videoWidth, videoHeight } = view.video

    ctx.imageSmoothingEnabled = view.imageFilter.isImageSmoothing
    const [dx, dy, dw, dh] = view.camera.drawImageParams({ width: videoWidth, height: videoHeight })
    ctx.filter = RenderManager.imageFilterToString(
      view.imageFilter
    )
    ctx.drawImage(view.video, dx, dy, dw, dh)

    const windowLevelsRange = view.windowLevelsRange
    const { windowLevels } = view.imageFilter
    const windowLow = windowLevels ? windowLevels[0] : windowLevelsRange[0]
    const windowHigh = windowLevels ? windowLevels[1] : windowLevelsRange[1]

    if (windowLow === windowLevelsRange[0] && windowHigh === windowLevelsRange[1]) { return }

    const frameViewport = ctx.getImageData(0, 0, view.width, view.height)
    const l = frameViewport.data.length / 4

    for (let i = 0; i < l; i++) {
      frameViewport.data[i * 4 + 0] = windowFunction(
        frameViewport.data[i * 4 + 0], windowLow, windowHigh
      )
      frameViewport.data[i * 4 + 1] = windowFunction(
        frameViewport.data[i * 4 + 1], windowLow, windowHigh
      )
      frameViewport.data[i * 4 + 2] = windowFunction(
        frameViewport.data[i * 4 + 2], windowLow, windowHigh
      )
    }

    ctx.putImageData(frameViewport, 0, 0)

    ctx.filter = 'none'
    ctx.imageSmoothingEnabled = true
  }

  static renderTiledImage (
    view: View,
    tiles: Tile[],
    ctx: CanvasRenderingContext2D
  ): void {
    ctx.imageSmoothingEnabled = view.imageFilter.isImageSmoothing
    ctx.filter = RenderManager.imageFilterToString(view.imageFilter)
    for (const tile of tiles) {
      const tileImage = tile.image()
      if (!isRenderableImage(tileImage)) { continue }
      ctx.drawImage(
        tileImage.data,
        -view.camera.getOffset().x + tile.cx,
        -view.camera.getOffset().y + tile.cy,
        tile.w,
        tile.h
      )
    }
    ctx.filter = 'none'
    ctx.imageSmoothingEnabled = true
  }

  public static renderMeasureRegion (view: View): void {
    const ctx = view.mainLayer.context
    if (!ctx) { return }

    const { measureRegion } = view.measureManager
    if (!measureRegion) { return }

    const { x, y, w, h } = measureRegion
    const topLeft = view.camera.imageViewToCanvasView(new Point({ x, y }))
    const bottomRight = view.camera.imageViewToCanvasView(new Point({ x: x + w, y: y + h }))
    const measureRect = new Rectangle(topLeft, bottomRight)
    drawDashedBox(ctx, measureRect)
  }

  public registerAnnotationRenderer (name: string, renderer: AnnotationTypeRenderer): void {
    if (this.annotationRenderer.has(name)) {
      console.warn(`WARNING '${name}' is already registered for rendering`)
      return
    }
    this.annotationRenderer.set(name, renderer)
  }

  public unregisterAnnotationRenderer (name: string): void {
    if (!this.annotationRenderer.has(name)) {
      console.warn(`WARNING Trying to unregister uknown renderer '${name}'`)
      return
    }
    this.annotationRenderer.delete(name)
  }

  public registerRasterRenderer (name: string, renderer: RasterTypeRenderer): void {
    if (this.rasterRenderer.has(name)) {
      console.warn(`WARNING '${name}' is already registered for rendering`)
      return
    }
    this.rasterRenderer.set(name, renderer)
  }

  public unregisterRasterRenderer (name: string): void {
    if (!this.rasterRenderer.has(name)) {
      console.warn(`WARNING Trying to unregister uknown renderer '${name}'`)
      return
    }
    this.rasterRenderer.delete(name)
  }

  public onRender (cb: (view: View) => void): CallbackHandle {
    return this.onRenderCallbacks.add(cb)
  }

  public renderRaw (
    view: View,
    image: LoadedImageWithTiles
  ): void {
    const ctx = view.mainLayer.context
    if (!ctx) { return }

    this.resetFrame(ctx, view.mainLayer.canvas, view.camera)

    if (!image.data) { return }
    // 'default' color map is hardcoded here, since we no longer apply
    // it this way and instead use a css filter.
    const transformedData = resolveTransformedImageData(
      image.data,
      this.windowLevels,
      'default',
      null
    )
    if (!transformedData) { return }
    ctx.imageSmoothingEnabled = this.isImageSmoothing
    const [dx, dy, dw, dh] = view.camera.drawImageParams(image)
    ctx.drawImage(transformedData, dx, dy, dw, dh)
    ctx.imageSmoothingEnabled = true

    this.emitRenderCallbacks(view)
  }

  public emitRenderCallbacks (view: View): void {
    // editor.layout is typed as never null, but that's a lie so 
    // onRenderCallbacks.call will result in sometimes raising errors
    // this resolves the immediate issue but there will be a separate ticket
    // to fix bad typing of editor.layout
    if (view.editor.layout && view.editor.activeView === view) {
      this.onRenderCallbacks.call(view)
    }
  }

  public renderWindowLevels (view: View): void {
    const ctx = view.mainLayer.context
    if (!ctx) { return }

    const { windowLevels } = view.imageFilter
    const windowLevelsRange = view.windowLevelsRange
    // Do not draw window levels when same as default window levels
    if (
      windowLevels[0] === windowLevelsRange[0] &&
      windowLevels[1] === windowLevelsRange[1]
    ) { return }

    const windowLevelWidth = windowLevels[1] - windowLevels[0]
    const windowLevelText = `W: ${windowLevelWidth} L: ${windowLevels[0] + windowLevelWidth / 2}`
    const windowLevelOffset = new Point({ x: view.width / 2, y: 50 }) as ImagePoint

    ctx.font = '24px Muli'
    ctx.fillStyle = 'white'
    ctx.shadowOffsetX = 1
    ctx.shadowOffsetY = 2
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)'
    ctx.textAlign = 'center'
    ctx.fillText(windowLevelText, windowLevelOffset.x, windowLevelOffset.y)
  }

  public rendererFor (
    type: string
  ): AnnotationTypeRenderer | MainAnnotationTypeRenderer | undefined {
    return this.annotationRenderer.get(type)
  }

  public rasterRendererFor (
    type: string
  ): RasterTypeRenderer | undefined {
    return this.rasterRenderer.get(type)
  }

  private resetFrame (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    camera: Camera
  ): void {
    canvas.width = camera.width
    canvas.height = camera.height
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  public renderAnnotation (
    drawFn: DrawCallback,
    view: View,
    layer: ILayer,
    annotation: Annotation,
    parentAnnotation?: Annotation,
    inferred: boolean = false
  ): void {
    let actualAnnotation = annotation
    if (annotation.isVideoAnnotation()) {
      const { data: annotationData } = annotation.inferVideoData(view)
      if (Object.keys(annotationData).length === 0) {
        view.measureManager.removeOverlayForAnnotation(annotation.id)
        view.overlayManager.removeOverlayForAnnotation(annotation.id)
        return
      }
      actualAnnotation = annotation.shallowClone({ data: annotationData })
    }

    const { currentTool } = view.editor.toolManager
    if (currentTool?.tool?.shouldRender && !currentTool.tool.shouldRender(actualAnnotation)) {
      view.measureManager.removeOverlayForAnnotation(annotation.id)
      view.overlayManager.removeOverlayForAnnotation(annotation.id)
      return
    }

    if (view.editor.activeView.measureManager.showMeasures && view.measureManager.measureRegion) {
      view.measureManager.updateOverlayForAnnotation(annotation)
    }

    const renderer = this.rendererFor(annotation.type)
    if (!renderer) { return }

    renderer.render(
      drawFn,
      view,
      layer,
      actualAnnotation,
      inferred,
      view.imageFilter,
      parentAnnotation
    )
    annotation.path2D = actualAnnotation.path2D
  }

  /**
   * Renders the given `raster` on to the given `layer` of the `view`,
   * with rendering properties (color, etc) defined by the various
   * `annotations` on the raster layer.
   *
   * @param view The view on which to render the raster.
   * @param layer The canvas layer object on which to render the to the raster.
   * @param raster The `Raster` object to render.
   * @param annotations The mask `Annotation`s to render on the `Raster`.
   */
  public renderRaster (
    view: View,
    layer: ILayer,
    raster: Raster,
    annotations: Annotation[],
  ): void {
    const actualAnnotations: Annotation[] = []

    annotations.forEach(annotation => {
      let actualAnnotation = annotation
      if (annotation.isVideoAnnotation()) {
        const { data: annotationData } = annotation.inferVideoData(view)
        if (Object.keys(annotationData).length === 0) {
          view.measureManager.removeOverlayForAnnotation(annotation.id)
          view.overlayManager.removeOverlayForAnnotation(annotation.id)
          return
        }
        actualAnnotation = annotation.shallowClone({ data: annotationData })
      }

      actualAnnotations.push(actualAnnotation)
    })

    // For now we just default to mask renderer as we need to be able to re-write mask
    // regions when we have no annotations. We could get around this by moving the
    // cached canvas to be owned by the raster itself, the renderer just to be
    // in charge of drawing.
    const renderer = this.rasterRendererFor('mask')
    if (!renderer) { return }

    renderer.render(view, layer, raster, actualAnnotations, false, view.imageFilter)
  }

  public renderComment (
    drawFn: DrawCallback | undefined,
    view: View,
    thread: EditorCommentThread
  ): void {
    const renderer = this.rendererFor('commentator')
    if (!renderer) { return }
    if (!drawFn) { return }
    renderer.render(
      drawFn,
      view,
      view.commentLayer,
      thread,
      false,
      view.imageFilter
    )
  }

  public renderSubAnnotations (
    drawFn: DrawCallback,
    view: View,
    layer: ILayer,
    annotation: Annotation
  ): void {
    if (!annotation.annotationClass) { return }
    if (!view.annotationManager.showSubAnnotations) { return }
    if (this.shouldForceHideSubAnnotations) { return }

    // break early if class has no subtypes
    if (
      view.annotationManager.getSubAnnotationTypesForClass(annotation.annotationClass).length === 0
    ) { return }

    if (isVideoSubAnnotations(annotation.subAnnotations)) {
      const subs = view.editor.activeView.annotationManager.inferVideoSubAnnotations(annotation)
      subs.forEach(subAnnotation => {
        this.renderAnnotation(drawFn, view, layer, subAnnotation, annotation)
      })
    } else {
      annotation.subAnnotations.forEach(subAnnotation => {
        this.renderAnnotation(drawFn, view, layer, subAnnotation, annotation)
      })
    }
  }

  public renderHistogram (canvas: HTMLCanvasElement, imageData: ImageData | null): void {
    this.clearHistogram(canvas)
    if (imageData) {
      this.drawHistogram(canvas, imageData, this.view.fileManager.metadata)
    }
  }

  private clearHistogram (canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d')
    if (!ctx) { return }
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  private drawHistogram (
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

  public cleanup (): void {
    this.onRenderCallbacks.clear()
    this.annotationRenderer.clear()
    this.rasterRenderer.clear()
  }
}
