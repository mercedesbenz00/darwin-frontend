import Hls, { Fragment } from 'hls.js'

import { Editor } from '@/engineV2/editor'
import { RenderManager } from '@/engineV2/managers'
import { Object2D } from '@/engineV2/models'
import { VideoView } from '@/engineV2/views'
import { V2DatasetItemPayload } from '@/store/types/V2DatasetItemPayload'
import { V2DatasetItemSlot } from '@/store/types/V2DatasetItemSlot'
import { getToken, isSafariBrowser } from '@/utils'

export class StreamView extends VideoView {
  private streamUrl: string = ''

  private _video: HTMLVideoElement | null = null
  public get video (): HTMLVideoElement | null {
    return this._video
  }

  private set video (element: HTMLVideoElement | null) {
    this._video = element
  }

  private _hls: Hls | null = null

  private isFrameLoaded: boolean = false

  constructor (public editor: Editor, file: V2DatasetItemSlot, item: V2DatasetItemPayload) {
    super(editor, file, item)

    if (isSafariBrowser()) {
      this.store.dispatch('toast/warning', {
        // eslint-disable-next-line
        content: 'Sorry, but Safari does not support Streamed video, you should use the Non-Streamed video version or switch to the Chrome browser instead',
        duration: 60000
      })
    }

    this.streamUrl = this.fileManager.getStreamUrl()
    this.setupHLS()
  }

  /**
   * Setup Stream connection using HLS lib.
   *
   * @returns
   */
  private setupHLS (): Promise<void> {
    if (!this.streamUrl) { return Promise.reject() }

    this.video = document.createElement('video')
    this.video.style.display = 'none'
    const hls = new Hls({
      xhrSetup: (xhr): void => {
        const token = getToken()
        xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      }
    })
    hls.attachMedia(this.video)

    return new Promise(resolve => {
      hls.once(Hls.Events.MEDIA_ATTACHED, () => {
        hls.loadSource(this.streamUrl)
        hls.on(Hls.Events.ERROR, (event, data) => console.error('error', event, data))
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          // the bearer token is only valid for the index not for the actual segments
          hls.config.xhrSetup = (): void => {}
        })

        hls.on(Hls.Events.FRAG_LOADING, (_, data) => {
          const { startIndex, endIndex } = this.fragToFrames(data.frag)

          if (this.currentFrameIndex >= startIndex && this.currentFrameIndex <= endIndex) {
            this.loading = true
          }
        })
        hls.on(Hls.Events.FRAG_LOADED, (_, data) => {
          this.loading = false

          const { startIndex, endIndex } = this.fragToFrames(data.frag)
          for (let i = startIndex; i < endIndex; i++) {
            this.fileManager.emit('frame:loaded', i)
          }
        })

        this.video?.addEventListener('canplay', () => {
          this.loading = false
        })
        this.video?.addEventListener('loadeddata', () => {
          this.jumpToFrame(0, true)
        })
        this.video?.addEventListener('timeupdate', () => {
          this.mainLayer.changed()
        })
      })
      this._hls = hls

      resolve()
    })
  }

  private fragToFrames (frag: Fragment): { startIndex: number, endIndex: number } {
    if (!this.video) { return { startIndex: 0, endIndex: 0 } }

    const { start, duration } = frag

    const startIndex = Math.floor(
      start / this.video.duration * this.totalFrames
    )
    const endIndex = Math.ceil(
      (start + duration) / this.video.duration * this.totalFrames
    )

    return {
      startIndex,
      endIndex
    }
  }

  async init (): Promise<void> {
    this.framesIndexes = this.fileManager.framesIndexes

    this.showFramesTool = this.framesIndexes.length > 1

    this.annotationsLayer.clear()
    this.mainLayer.clear()
    this.mainLayer.add(new Object2D(
      'stream-video',
      (ctx, canvas) => {
        if (this.isPlaying || !this.isFrameLoaded || !this.currentFrame) {
          RenderManager.renderHTMLVideo(
            this,
            canvas
          )
        } else {
          // if video is not playing, we render a still of the extracted frame
          // closest to the currently paused position of the video
          RenderManager.drawImageOnCanvas(
            this,
            canvas,
            this.currentFrame
          )
        }

        if (this.measureManager.showMeasures) {
          RenderManager.renderMeasureRegion(this)
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

    this.setupHLS()
  }

  play (): void {
    if (!this.video) { return }
    if (this.isPlaying) { return }
    const length = this.totalFrames

    this.video.play()
    this.isPlaying = true

    this.videoInterval = setInterval(() => {
      if (this.isLoading) { return }
      if (!this.video) { return }
      if (this.isPlaying && this.video.ended) {
        this.video.play()
      }

      const newFrame = Math.round(
        this.video.currentTime / this.video.duration * length
      )
      const nextFrameIndex = newFrame % length
      this.currentFrameIndex = nextFrameIndex

      // jumping between frames changes subAnnotation content so the redraw option is enabled
      this.annotationManager.invalidateAnnotationCache()
      this.commentManager.deselectCommentThread()

      this.allLayersChanged()
    }, 1000 / this.fileManager.fps)
  }

  async pause (): Promise<void> {
    if (!this.isPlaying) { return }

    if (this.video) {
      this.video.pause()
    }

    clearInterval(this.videoInterval)
    this.isPlaying = false

    await this.jumpToFrame(this.currentFrameIndex)
  }

  /**
   * Fast jumpToFrame using video only
   *
   * @param {number} frameIndex
   * @returns
   */
  lqJumpToFrame (frameIndex: number): Promise<void> {
    // Force to render using the video element
    // JumpToFrame will set it to true to render an image
    this.isFrameLoaded = false
    this.currentFrameIndex = frameIndex

    if (this.video && this.video.duration > 0) {
      this.video.currentTime = this.video.duration / this.totalFrames * this.currentFrameIndex
    }

    // jumping between frames changes subAnnotation content so the redraw option is enabled
    this.annotationManager.invalidateAnnotationCache()
    this.commentManager.deselectCommentThread()

    this.allLayersChanged()

    return Promise.resolve()
  }

  async jumpToFrame (frameIndex: number, resetZoom: boolean = false): Promise<void> {
    if (frameIndex < this.firstFrameIndex || frameIndex > this.lastFrameIndex) { return }

    this.currentFrameIndex = Math.max(0, Math.min(frameIndex, this.totalFrames - 1))

    if (this.video && this.video.duration > 0) {
      this.video.currentTime = this.video.duration / this.totalFrames * this.currentFrameIndex
      this.mainLayer.changed()
    }

    let shouldResetZoom = resetZoom

    if (this.fileManager.isHQFrameLoaded(frameIndex)) {
      this.loading = false
      this.currentFrame = await this.fileManager.getHQFrame(this.currentFrameIndex)
      return
    }

    this.isFrameLoaded = false
    try {
      const lqFrame = await this.fileManager.getLQFrame(frameIndex)

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
        this.isFrameLoaded = true
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
        this.loading = false
        this.isFrameLoaded = true
      }
    })

    if (this.video) {
      this.camera.setImage({
        width: this.video.videoWidth,
        height: this.video.videoHeight
      }, resetZoom)
    }
  }

  cleanup (): void {
    super.cleanup()

    if (this.video) {
      this.video.pause()
      this.video.remove()
      this.video = null
    }
    if (this._hls) {
      this._hls.destroy()
      this._hls = null
    }
  }
}
