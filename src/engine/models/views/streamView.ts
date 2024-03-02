import Hls, { Fragment } from 'hls.js'
import { Store } from 'vuex'

import { Editor } from '@/engine/editor'
import { VideoView } from '@/engine/models/views'
import {
  OriginBasedFrameIndex,
  ViewManagers
} from '@/engine/models/views/types'
import { loadHqFrame } from '@/engine/utils'
import { LoadedFrame, RenderableImage } from '@/store/modules/workview/types'
import { DatasetItemPayload, RootState } from '@/store/types'
import { getToken, isSafariBrowser } from '@/utils'
import { resolveVariable } from '@/utils/config'

export class StreamView extends VideoView {
  public video: HTMLVideoElement | null = null

  private _hls: Hls | null = null
  private _isLoading: boolean = true

  constructor (
    public editor: Editor,
    public store: Store<RootState>,
    managers: ViewManagers
  ) {
    super(editor, store, managers)

    if (isSafariBrowser()) {
      store.dispatch('toast/warning', {
        // eslint-disable-next-line
        content: 'Sorry, but Safari does not support Streamed video, you should use the Non-Streamed video version or switch to the Chrome browser instead',
        duration: 60000
      })
    }

    this.setupHLS()
  }

  get renderingImageData (): ImageData | null {
    return this.renderingImage?.rawData || null
  }

  get renderingImage (): RenderableImage | null {
    if (!this.video) { return null }

    const tmpCanvas = document.createElement('canvas')
    tmpCanvas.width = this.video.videoWidth
    tmpCanvas.height = this.video.videoHeight
    const ctx = tmpCanvas.getContext('2d')
    if (!ctx) { return null }
    ctx.drawImage(this.video, 0, 0)
    const imageBuf = ctx.getImageData(0, 0, this.video.videoWidth, this.video.videoHeight)

    const image = new Image()
    image.src = tmpCanvas.toDataURL()

    tmpCanvas.remove()

    return {
      data: image,
      rawData: imageBuf,
      transformedData: null,
      lastWindowLevels: null,
      lastColorMap: null
    }
  }

  get isImageLoading (): boolean {
    return this._isLoading
  }

  /**
   * Setup Stream connection using HLS lib.
   *
   * @returns
   */
  private setupHLS (): Promise<void> {
    if (!this.currentItem) { return Promise.resolve() }

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
        if (!this.currentItem) { return }

        const baseURL = resolveVariable(process.env.VUE_APP_BASE_API, '$BASE_API') as string
        hls.loadSource(`${baseURL}/dataset_items/${this.currentItem.id}/stream`)
        hls.on(Hls.Events.ERROR, (event, data) => console.error('error', event, data))
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          // the bearer token is only valid for the index not for the actual segments
          hls.config.xhrSetup = (): void => {}
        })

        hls.on(Hls.Events.FRAG_LOADING, (_, data) => {
          const { startIndex, endIndex } = this.fragToFrames(data.frag)

          if (this.currentFrameIndex >= startIndex && this.currentFrameIndex <= endIndex) {
            this._isLoading = true
          }
        })
        hls.on(Hls.Events.FRAG_LOADED, (_, data) => {
          this._isLoading = false

          const { startIndex, endIndex } = this.fragToFrames(data.frag)
          for (let i = startIndex; i < endIndex; i++) {
            this.onFrameLoadedCallbacks.call(i)
          }
        })

        this.video?.addEventListener('canplay', () => {
          this._isLoading = false
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

  playVideo (): void {
    if (this.isPlaying) { return }
    if (!this.loadedVideo) { return }
    if (!this.video) { return }
    const length = this.totalFrames

    this.video.play()
    this.isPlaying = true

    this.videoInterval = setInterval(() => {
      if (!this.video) { return }
      if (this.isPlaying  && this.video.ended) {
        this.video.play()
      }

      const newFrame = Math.round(
        this.video.currentTime / this.video.duration * this.totalFrames
      )
      const nextFrameIndex = newFrame % length
      if (this.zeroBasedCurrentFrameIndex !== nextFrameIndex) {
        this.zeroBasedCurrentFrameIndex = nextFrameIndex
      }
      this.editor.invalidateAnnotationCache()
      this.allLayersChanged()
    }, 1000 / 24)
  }

  /**
   * Loads frame by index if its data not exist.
   *
   * @param index
   * @returns
   */
  async loadFrame (index: number): Promise<void> {
    if (index < 0 || index > this.lastFrameIndex) { return }

    if (!this.loadedVideo) { return }

    if (this.pendingFrames.size === 0) { return }

    const originFrameIndex = this.toOriginBasedIndex(index)

    // Skip loading for existing frame's data.
    // hqData will be loaded separately on video pause or jumpToFrame.
    if (
      !this.loadedVideo.frames[originFrameIndex] ||
      this.loadedVideo.frames[originFrameIndex].hqData
    ) {
      return
    }

    if (!this.pendingFrames.has(index)) { return }

    const frame = this.pendingFrames.get(index)

    if (!frame) { return }

    await loadHqFrame(frame, index, this)

    this.mainLayer.changed()

    this.pendingFrames.delete(index)
  }

  stopVideo (): void {
    if (this.video) {
      this.video.pause()
    }

    clearInterval(this.videoInterval)
    this.isPlaying = false

    this.jumpToFrame(this.zeroBasedCurrentFrameIndex)
  }

  get totalFrames (): number {
    return this.currentItem?.dataset_video?.total_frames || 0
  }

  async setItem (item: DatasetItemPayload | null): Promise<void> {
    if (this.video) {
      this.video.pause()
      this.video.remove()
      this.video = null
    }
    if (this._hls) {
      this._hls.destroy()
      this._hls = null
    }

    this.isPlaying = false

    this.currentItem = item

    this.annotationsLayer.clear()
    this.mainLayer.remove('image')
    this.mainLayer.add({
      id: 'image',
      render: () => {
        if (!this.video) { return }

        this.renderManager.renderStreamVideo(this)
      }
    })

    const { currentItem, loadingItem, loadedVideo } = this
    if (!currentItem) { return }

    // Only need to do the reset/reload if item actually changed
    // Item could also change if it gets a workflow, or gets assigned,
    // in which case, the item remains the same.
    let itemChanged = !loadedVideo || loadedVideo.id !== currentItem.dataset_video?.id

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
    this.loadedVideo = null

    // Load new loaded image
    this.loadingItem = currentItem

    const res = await this.editor.itemManager.loadVideoItem(this.loadingItem)

    this.loadingItem = null

    if (!res.data) { return }

    this.loadedVideo = res.data
    // Recalculates default window levels for loaded video
    this.setImageFilter({
      ...this.imageFilter,
      windowLevels: this.defaultWindowLevels
    })

    if (res.onVideoChange) {
      const { release } = res.onVideoChange((
        frames: { [key: OriginBasedFrameIndex]: LoadedFrame}
      ) => this.pushVideoFramesHandler(frames))

      this.onCleanup.push(release)
    }

    if (!this.loadedVideo) { return }

    this.setFramesIndexes(Object.keys(this.loadedVideo.frames))

    this.jumpToFrame(0, true)

    this.setupHLS()
  }

  // eslint-disable-next-line
  async jumpToFrame (frameIndex: number, resetZoom: boolean = false): Promise<void> {
    if (!this.loadedVideo) { return Promise.resolve() }

    this.zeroBasedCurrentFrameIndex = Math.max(0, Math.min(frameIndex, this.totalFrames - 1))

    if (this.video && this.video.duration > 0) {
      this.video.currentTime =
        this.video.duration / this.totalFrames * this.zeroBasedCurrentFrameIndex
    }

    if (!this.loadedVideo) { return }

    if (this.video) {
      this.camera.setImage({
        width: this.video.videoWidth,
        height: this.video.videoHeight
      }, resetZoom)

      if (resetZoom) { this.scaleToFit() }
    }

    this.editor.invalidateAnnotationCache()
    // jumping between frames changes subAnnotation content so the redraw option is enabled

    this.allLayersChanged()

    return super.jumpToFrame(frameIndex, resetZoom)
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

  protected onCleanup: Function[] = []

  cleanup (): void {
    if (this.video) {
      this.video.pause()
      this.video.remove()
      this.video = null
    }
    if (this._hls) {
      this._hls.destroy()
      this._hls = null
    }

    this.isPlaying = false

    this.onCleanup.forEach(callback => callback())

    super.cleanup()
  }
}
