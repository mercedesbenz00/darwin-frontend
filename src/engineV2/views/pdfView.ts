import { VideoView } from '@/engineV2/views'

export class PdfView extends VideoView {
  play (): void {
    if (this.isPlaying) { return }
    this.isPlaying = true
    const length = this.framesIndexes.length

    this.videoInterval = setInterval(async () => {
      if (this.isLoading) { return }

      const nextFrameIndex = (this.currentFrameIndex + 1) % length
      this.currentFrameIndex = nextFrameIndex

      if (!this.fileManager.isFrameLoaded(this.currentFrameIndex)) {
        this.loading = true
      }

      const lqFrame = await this.fileManager.getHQFrame(this.currentFrameIndex)
      if (!lqFrame) { return }

      this.currentFrame = lqFrame
      this.loading = false

      // jumping between frames changes subAnnotation content so the redraw option is enabled
      this.annotationManager.invalidateAnnotationCache()
      this.commentManager.deselectCommentThread()

      this.allLayersChanged()
    }, 1000 / this.fileManager.fps)
  }
}
