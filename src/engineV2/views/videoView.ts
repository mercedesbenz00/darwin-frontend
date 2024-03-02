import { RenderManager } from '@/engineV2/managers'
import { Object2D, Annotation, ObjectHTML } from '@/engineV2/models'
import { View } from '@/engineV2/views'

export class VideoView extends View {
  protected videoInterval: any

  public isPlaying: boolean = false

  async init (): Promise<void> {
    if (this.fileManager.imageWidth && this.fileManager.imageHeight) {
      this.camera.setImage({
        width: this.fileManager.imageWidth,
        height: this.fileManager.imageHeight
      })
    }

    this.fileManager.loadFrames()

    this.isPlaying = false

    this.framesIndexes = this.fileManager.framesIndexes

    this.showFramesTool = this.framesIndexes.length > 1

    this.mainLayer.clear()
    this.mainLayer.add(new Object2D(
      'video',
      (ctx, canvas) => {
        if (this.currentFrame) {
          RenderManager.drawImageOnCanvas(
            this,
            canvas,
            this.currentFrame
          )
        }
      }
    ))

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

    await this.jumpToFrame(0, true)

    this.scaleToFit()
  }

  play (): void {
    if (this.isPlaying) { return }
    this.isPlaying = true
    const length = this.framesIndexes.length

    this.videoInterval = setInterval(async () => {
      if (this.isLoading) { return }

      const nextFrameIndex = (this.currentFrameIndex + 1) % length
      await this.lqJumpToFrame(nextFrameIndex)
    }, 1000 / this.fileManager.fps)
  }

  async pause (): Promise<void> {
    if (!this.isPlaying) { return }
    clearInterval(this.videoInterval)
    this.isPlaying = false

    await this.jumpToFrame(this.currentFrameIndex)
  }

  togglePlayPause (): void {
    if (this.isPlaying) {
      this.pause()
    } else {
      this.play()
    }
  }

  protected setAnnotations (): void {
    this.overlayManager.reset()
    this.annotationsLayer.clear()
    this.annotationsOverlayLayer.clear()
    // It returns sorted array
    // Upper first. So need to reverse.
    // mainAnnotations returns new filtered array
    // so it's ok to reverse it in place.
    const objects = this.annotationManager.frameAnnotations.map((annotation: Annotation) => {
      annotation.clearCache()

      this.annotationsOverlayLayer.add(this.createAnnotationOverlay(annotation.id))

      return this.createAnnotationObject2D(annotation.id)
    })

    this.annotationsLayer.add(objects)
  }

  protected createAnnotationOverlay (annotationId: Annotation['id']): ObjectHTML {
    return new ObjectHTML(
      `overlay_${annotationId}`,
      () => {
        const annotation = this.annotationManager.getAnnotation(annotationId)
        if (!annotation) {
          this.annotationsOverlayLayer.delete(annotationId)
          return
        }

        const noOverlayTypes = ['string', 'graph', 'table']
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

  cleanup (): void {
    super.cleanup()

    clearInterval(this.videoInterval)
    this.framesIndexes.length = 0
    this.isPlaying = false
  }
}
