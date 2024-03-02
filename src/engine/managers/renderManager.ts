import { Editor } from '@/engine/editor'
import { drawDashedBox } from '@/engine/graphics'
import {
  Annotation,
  CommentThread,
  LoadedImageWithTiles,
  AnnotationTypeRenderer,
  MainAnnotationTypeRenderer,
  isVideoSubAnnotations,
  StreamView
} from '@/engine/models'
import { getVisibleTiles, isRenderableImage } from '@/engine/models/tiler'
import { IView } from '@/engine/models/views/types'
import { getWindowLevelsRange, resolveTransformedImageData, windowFunction } from '@/engine/utils'
import { CallbackHandle, CallbackHandleCollection } from '@/engineCommon/callbackHandler'
import { Camera } from '@/engineCommon/camera'
import { ImageManipulationFilter, WindowLevels } from '@/engineCommon/imageManipulation'
import { ImagePoint, Point } from '@/engineCommon/point'
import { Rectangle } from '@/engineCommon/rectangle'
import { LoadedVideo, RenderableImage } from '@/store/modules/workview/types'
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
  private onRenderCallbacks: CallbackHandleCollection<[IView]> =
    new CallbackHandleCollection<[IView]>()

  private annotationRenderer = new Map<string, AnnotationTypeRenderer>()
  private imageFilter: string = ''
  private windowLevels: WindowLevels | null = null
  private isImageSmoothing: boolean = false
  public editSubAnnotations: boolean = true
  public scale: number = 1

  // rendering sub annotations is determined by a flag in the workview store.
  // this additional flag on the renderer allows certain calls to override the store flag
  public shouldForceHideSubAnnotations = false;

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

  public onRender (cb: (view: IView) => void): CallbackHandle {
    return this.onRenderCallbacks.add(cb)
  }

  public setImageFilter (filter: ImageManipulationFilter): void {
    let filterString = ''

    if (filter.colorMap !== 'default') {
      /**
       * Sets color map filter using ColorMaps.vue
       * by its id
       */
      filterString += ` url(#color-map_${filter.colorMap})`
    }

    this.imageFilter = filterString.trim() || 'none'
    this.windowLevels = filter.windowLevels
    this.isImageSmoothing = filter.isImageSmoothing
  }

  private renderImage (
    image: LoadedImageWithTiles,
    camera: Camera,
    ctx: CanvasRenderingContext2D
  ): void {
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
    const [dx, dy, dw, dh] = camera.drawImageParams(image)
    ctx.filter = this.imageFilter
    ctx.drawImage(transformedData, dx, dy, dw, dh)
    ctx.filter = 'none'
    ctx.imageSmoothingEnabled = true
  }

  private renderHTMLImage (
    image: RenderableImage,
    videoMetadata: DatasetVideoMetadata | null,
    view: IView
  ): void {
    const ctx = view.mainLayer.context
    if (!ctx) { return }

    // 'default' color map is hardcoded here, since we no longer apply
    // it this way and instead use a css filter.
    const transformedData = resolveTransformedImageData(
      image,
      this.windowLevels,
      'default',
      videoMetadata
    )
    if (!transformedData) { return }

    ctx.imageSmoothingEnabled = this.isImageSmoothing
    const [dx, dy, dw, dh] = view.camera.drawImageParams(image.data)
    ctx.filter = this.imageFilter
    ctx.drawImage(transformedData, dx, dy, dw, dh)
    ctx.filter = 'none'
    ctx.imageSmoothingEnabled = true
  }

  private renderTiledImage (
    image: LoadedImageWithTiles,
    camera: Camera,
    ctx: CanvasRenderingContext2D,
    editor: Editor
  ): void {
    const tiles = getVisibleTiles(image, camera, () => {
      editor.viewsList.forEach(view => {
        view.allLayersChanged()
      })
    })
    ctx.imageSmoothingEnabled = this.isImageSmoothing
    ctx.filter = this.imageFilter
    for (const tile of tiles) {
      const tileImage = tile.image()
      if (!isRenderableImage(tileImage)) { continue }
      ctx.drawImage(
        tileImage.data,
        -camera.getOffset().x + tile.cx,
        -camera.getOffset().y + tile.cy,
        tile.w,
        tile.h
      )
    }
    ctx.filter = 'none'
    ctx.imageSmoothingEnabled = true
  }

  public drawImageOnCanvas (
    editor: Editor,
    camera: Camera,
    canvas: HTMLCanvasElement,
    image: LoadedImageWithTiles
  ): boolean {
    // clicker provide tmp canvas so we need to set its size here.
    canvas.width = camera.width
    canvas.height = camera.height
    const ctx = canvas.getContext('2d')
    if (!ctx) { return false }

    ctx.clearRect(0, 0, camera.width, camera.height)
    if (image.format === 'tiled') {
      this.renderTiledImage(image, camera, ctx, editor)
    } else {
      if (!image.data) { return false }
      this.renderImage(image, camera, ctx)
    }
    return true
  }

  public renderRaw (
    view: IView,
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

  public emitRenderCallbacks (view: IView): void {
    if (view.editor.activeView === view) {
      this.onRenderCallbacks.call(view)
    }
  }

  public renderVideoByIndex (
    view: IView,
    frameIndex: number,
    video: LoadedVideo
  ): void {
    const { videoMetadata } = view
    const currentFrame = video.frames[frameIndex]
    if (!currentFrame) { return }

    if (currentFrame.hqData) {
      this.renderHTMLImage(currentFrame.hqData, videoMetadata, view)
    } else if (currentFrame.lqData) {
      this.renderHTMLImage(currentFrame.lqData, videoMetadata, view)
    } else {
      return
    }

    if (view.editor.showMeasures) {
      this.renderMeasureRegion(view)
    }

    this.emitRenderCallbacks(view)
  }

  public renderStreamVideo (view: StreamView): void {
    const { videoMetadata } = view

    if (view.isPlaying) {
      this.renderHTMLVideo(view, this.windowLevels, view.videoMetadata)
    } else {
      // if video is not playing, we render a still of the extracted frame
      // closest to the currently paused position of the video
      const currentFrame = view.frames[view.currentFrameIndex]
      if (!currentFrame) { return }

      if (currentFrame.hqData) {
        this.renderHTMLImage(currentFrame.hqData, videoMetadata, view)
      } else if (currentFrame.lqData) {
        this.renderHTMLImage(currentFrame.lqData, videoMetadata, view)
      } else {
        // if the paused video has no hq or lq frame available yet
        // we exit from the render pipeline early and do not render anything else
        return
      }
    }

    if (view.editor.showMeasures) {
      this.renderMeasureRegion(view)
    }

    this.emitRenderCallbacks(view)
  }

  private renderMeasureRegion (view: IView): void {
    const ctx = view.mainLayer.context
    if (!ctx) { return }

    const { measureRegion } = view.editor
    if (!measureRegion) { return }

    const { x, y, w, h } = measureRegion
    const topLeft = view.camera.imageViewToCanvasView(new Point({ x, y }))
    const bottomRight = view.camera.imageViewToCanvasView(new Point({ x: x + w, y: y + h }))
    const measureRect = new Rectangle(topLeft, bottomRight)
    drawDashedBox(ctx, measureRect)
  }

  public renderWindowLevels (view: IView): void {
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

  private resetFrame (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    camera: Camera
  ): void {
    canvas.width = camera.width
    canvas.height = camera.height

    const width = canvas.width
    const height = canvas.height
    ctx.clearRect(0, 0, width, height)
  }

  public renderAnnotation (
    view: IView,
    annotation: Annotation,
    parentAnnotation?: Annotation,
    inferred: boolean = false
  ): void {
    let actualAnnotation = annotation
    if (annotation.isVideoAnnotation()) {
      const { data: annotationData } = annotation.inferVideoData(view)
      if (Object.keys(annotationData).length === 0) {
        view.measureManager.removeOverlayForAnnotation(annotation)
        view.overlayManager.removeOverlayForAnnotation(annotation)
        return
      }
      actualAnnotation = annotation.shallowClone({ data: annotationData })
    }

    const { currentTool } = view.editor.toolManager
    if (currentTool?.tool?.shouldRender && !currentTool.tool.shouldRender(actualAnnotation)) {
      view.measureManager.removeOverlayForAnnotation(annotation)
      view.overlayManager.removeOverlayForAnnotation(annotation)
      return
    }

    if (view.editor.showMeasures && view.editor.measureRegion) {
      view.measureManager.updateOverlayForAnnotation(annotation)
    }

    const renderer = this.annotationRenderer.get(annotation.type)
    if (!renderer) { return }

    renderer.render(view, actualAnnotation, inferred, view.imageFilter, parentAnnotation)
    annotation.path2D = actualAnnotation.path2D
  }

  public renderComment (
    view: IView,
    commentThread: CommentThread
  ): void {
    const renderer = this.annotationRenderer.get('commentator')
    if (!renderer) { return }

    renderer.render(
      view,
      commentThread,
      false,
      view.imageFilter
    )
  }

  public renderSubAnnotations (
    view: IView,
    annotation: Annotation
  ): void {
    if (!annotation.annotationClass) { return }
    if (!view.editor.showSubAnnotations) { return }
    if (this.shouldForceHideSubAnnotations) { return }

    // break early if class has no subtypes
    if (
      view.editor.getSubAnnotationTypesForClass(annotation.annotationClass).length === 0
    ) { return }

    if (isVideoSubAnnotations(annotation.subAnnotations)) {
      const subs = view.editor.inferVideoSubAnnotations(annotation)
      subs.forEach(subAnnotation => {
        this.renderAnnotation(view, subAnnotation, annotation)
      })
    } else {
      annotation.subAnnotations.forEach(subAnnotation => {
        this.renderAnnotation(view, subAnnotation, annotation)
      })
    }
  }

  /**
   * Duplicates frame from Video inside the canvas
   * to support annotations render.
   *
   * @param view
   * @returns
   */
  public renderHTMLVideo (
    view: StreamView,
    windowLevels: WindowLevels | null,
    videoMetadata: DatasetVideoMetadata | null = null
  ): void {
    const ctx = view.mainLayer.context

    if (!ctx) { return }
    if (!view.video) { return }

    const HAVE_NOTHING = 0
    if (view.video.readyState === HAVE_NOTHING) { return }

    const { videoWidth, videoHeight } = view.video

    ctx.imageSmoothingEnabled = this.isImageSmoothing
    const [dx, dy, dw, dh] = view.camera.drawImageParams({ width: videoWidth, height: videoHeight })
    ctx.filter = this.imageFilter
    ctx.drawImage(view.video, dx, dy, dw, dh)

    const windowLevelsRange = getWindowLevelsRange(videoMetadata?.colorspace)
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

  public cleanup (): void {
    this.onRenderCallbacks.clear()
    this.annotationRenderer.clear()
  }
}
