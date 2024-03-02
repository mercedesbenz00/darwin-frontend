import Vue from 'vue'
import { Store } from 'vuex'

import { Editor } from '@/engine/editor'
import { FramesLoader } from '@/engine/managers/framesLoader'
import {
  OriginBasedFrameIndex,
  ViewManagers,
  ZeroBasedFrameIndex
} from '@/engine/models/views/types'
import { View } from '@/engine/models/views/view'
import { CallbackHandle, CallbackHandleCollection } from '@/engineCommon/callbackHandler'
import { LoadedFrame, LoadedVideo } from '@/store/modules/workview/types'
import {
  RootState,
  DatasetItemPayload
} from '@/store/types'

export class VideoView extends View {
  protected _loadedVideo: LoadedVideo | null = null

  private _framesIndexes: Set<OriginBasedFrameIndex> = new Set()
  private _frames: { [key: OriginBasedFrameIndex]: LoadedFrame } = {}
  private _zeroBasedFrames: { [key: ZeroBasedFrameIndex]: LoadedFrame } = {}
  private _zeroBasedFramesIndexes: Set<ZeroBasedFrameIndex> = new Set()

  private framesLoader: FramesLoader

  private _zeroBasedCurrentFrame: ZeroBasedFrameIndex = 0

  private onFramesLoaderRelease: Function | null = null

  constructor (
    public editor: Editor,
    public store: Store<RootState>,
    managers: ViewManagers
  ) {
    super(editor, store, managers)

    this.framesLoader = new FramesLoader(this, editor)
  }

  /**
   * @override
   */
  get currentFrameIndex (): OriginBasedFrameIndex {
    return this.toOriginBasedIndex(this._zeroBasedCurrentFrame)
  }

  /**
   * @override
   */
  set currentFrameIndex (value: OriginBasedFrameIndex) {
    this.commentManager.deselectAllCommentThreads()

    this._zeroBasedCurrentFrame = this.toZeroBasedIndex(value)
  }

  /**
   * @override
   */
  get totalFrames (): number {
    // DICOM view frames count
    if (this.itemGroup) {
      return this.itemGroup.length
    }

    // To reduce calculations.
    // Object.keys to keeps tests passes.
    // Not all tests use total_frames.
    return this.currentItem?.dataset_video?.total_frames ||
      (this.loadedVideo ? Object.keys(this.loadedVideo.frames).length : 0)
  }

  /**
   * @override
   */
  get framesIndexes (): OriginBasedFrameIndex[] {
    return [...this._framesIndexes.values()]
  }

  /**
   * @override
   */
  get frames (): { [key: number]: LoadedFrame } {
    return this._frames
  }

  /**
   * @override
   */
  get zeroBasedFrames (): { [key: number]: LoadedFrame } {
    return this._zeroBasedFrames
  }

  /**
   * @override
   */
  get zeroBasedFramesIndexes (): ZeroBasedFrameIndex[] {
    return [...this._zeroBasedFramesIndexes.values()]
  }

  /**
   * @override
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
    if (!this._framesIndexes.size) { return }

    // Need to restrict the frameIndex range into valid range.
    this.zeroBasedCurrentFrameIndex = Math.max(0, Math.min(frameIndex, this.totalFrames - 1))

    this.currentFrameIndex = this.toOriginBasedIndex(frameIndex)

    await this.framesLoader.setNextFrameToLoad(this.currentFrameIndex)

    if (resetZoom) { this.scaleToFit() }
    /**
     * Await for first frame to be loaded
     *
     * For Normal videos, we load `lqFrame` first and load `hqframe`.
     * For DICOM videos, we only load `lqFrame`.
     * For PDF videos, we only load `hqFrame`.
     */
    if (this.currentFrameIndex in this.frames) {
      const frame = this.frames[this.currentFrameIndex]

      if (!frame) { return }

      if (frame.hqData) {
        this.camera.setImage(frame.hqData.data, resetZoom)
      } else if (frame.lqData) {
        this.camera.setImage(frame.lqData.data, resetZoom)

        this.framesLoader.loadHqFrame(frame, this.currentFrameIndex)
      } else {
        await this.framesLoader.loadHqFrame(frame, this.currentFrameIndex)
        if (resetZoom) { this.scaleToFit() }
      }
    }

    this.editor.invalidateAnnotationCache()
    // jumping between frames changes subAnnotation content so the redraw option is enabled

    this.allLayersChanged()
  }

  /**
   * @override
   */
  playVideo (): void {
    if (this.isPlaying) { return }
    if (!this.loadedVideo) { return }
    this.isPlaying = true
    const length = this._framesIndexes.size

    this.videoInterval = setInterval(() => {
      if (!this.loadedVideo) { return }

      const nextFrameIndex = (this.zeroBasedCurrentFrameIndex + 1) % length
      if (
        !this.loadedVideo.frames[this.toOriginBasedIndex(nextFrameIndex)] ||
        (
          !this.loadedVideo.frames[this.toOriginBasedIndex(nextFrameIndex)]?.hqData &&
          !this.loadedVideo.frames[this.toOriginBasedIndex(nextFrameIndex)]?.lqData
        )
      ) {
        this.framesLoader.setNextFrameToLoad(nextFrameIndex)
        return
      }
      this.zeroBasedCurrentFrameIndex = nextFrameIndex
      this.invalidateAnnotationCache()
      this.allLayersChanged()
    }, 1000 / 24)
  }

  /**
   * @override
   */
  stopVideo (): void {
    if (!this.isPlaying) { return }
    if (!this.loadedVideo) { return }
    clearInterval(this.videoInterval)
    this.isPlaying = false

    // Since the video just stopped, ensure that we are loading the hq frame
    // If video is dicom, then do not load hq frames
    // If video is pdf, we always load hq frames so no need to reload it again
    const currentFrame = this.loadedVideo.frames[this.currentFrameIndex]

    if (!currentFrame) { return }

    if (!this.isDicomItem && !this.isPdfItem) {
      this.framesLoader.loadHqFrame(currentFrame, this.currentFrameIndex)
    }
  }

  /**
   * @override
   */
  get isImageLoading (): boolean {
    const { loadedVideo } = this

    if (!loadedVideo) { return true }

    const currentFrame = loadedVideo.frames[this.currentFrameIndex]

    if (!currentFrame) { return true }

    return !(currentFrame.lqData || currentFrame.hqData)
  }

  /**
   * @override
   */
  get lastFrameIndex (): OriginBasedFrameIndex {
    return this.totalFrames - 1 || 0
  }

  /**
   * @override
   */
  async setItem (
    item: DatasetItemPayload| null,
    framesGroup: number[] | null = null
  ): Promise<void> {
    if (this.onFramesLoaderRelease) { this.onFramesLoaderRelease() }
    this.resetFrames()
    this._zeroBasedCurrentFrame = 0
    const { release } = this.framesLoader.onFrameLoaded((
      index: OriginBasedFrameIndex,
      frame: LoadedFrame
    ) => {
      this.frameLoadedHandler(index, frame)
    })
    this.onFramesLoaderRelease = release

    this.currentItem = item

    this.annotationsLayer.clear()
    this.mainLayer.remove('image')
    this.mainLayer.add({
      id: 'image',
      render: () => {
        const { loadedVideo } = this

        if (loadedVideo) {
          return this.renderManager.renderVideoByIndex(
            this,
            this.currentFrameIndex,
            loadedVideo
          )
        }
      }
    })

    this.framesGroup = framesGroup

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

    if (framesGroup) {
      this.setFramesIndexes(framesGroup)
    } else {
      this.setFramesIndexes(Object.keys(this.loadedVideo.frames))
    }

    this.jumpToFrame(0, true)
  }

  private frameLoadedHandler (index: OriginBasedFrameIndex, frame: LoadedFrame): void {
    if (!this.loadedVideo) { return }

    // We rely on Vue reactivity
    Vue.set(this.loadedVideo.frames, index, frame)
    this._frames[index] = frame
    this._zeroBasedFrames[this.toZeroBasedIndex(index)] = frame

    this.onFrameLoadedCallbacks.call(index)
  }

  protected pushVideoFramesHandler (
    frames: { [key: OriginBasedFrameIndex]: LoadedFrame }
  ): void {
    Object.keys(frames).forEach((key: string) => {
      if (!this.loadedVideo) { return }

      const frameIndex = parseInt(key)
      const frame = frames[frameIndex]

      if (!frame) { return }

      // We rely on Vue reactivity
      Vue.set(this.loadedVideo.frames, frameIndex, frame)

      if (!this.itemGroup) {
        this.pushFramesIndex(frameIndex)
      }
    })

    if (this.itemGroup) {
      this.setFramesIndexes(this.itemGroup)
    }
  }

  protected resetFrames (): void {
    this._framesIndexes.clear()
    this._frames = {}
    this._zeroBasedFrames = {}
  }

  protected setFramesIndexes (frames: number[] | string[]): void {
    this.resetFrames()

    frames.forEach(key => {
      this.pushFramesIndex(key)
    })
  }

  private pushFramesIndex (key: number | string): void {
    if (!this.loadedVideo) { return }

    const frameIndex = parseInt(key as string)
    this._framesIndexes.add(frameIndex)
    this._zeroBasedFramesIndexes.add(this.toZeroBasedIndex(frameIndex))
    this._frames[frameIndex] = this.loadedVideo.frames[frameIndex]
    this._zeroBasedFrames[this.toZeroBasedIndex(frameIndex)] =
      this.loadedVideo.frames[frameIndex]

    if (
      !this.loadedVideo.frames[frameIndex]?.lqData &&
      !this.loadedVideo.frames[frameIndex]?.hqData
    ) {
      this.framesLoader.addFramesToLoad({ [frameIndex]: this.loadedVideo.frames[frameIndex] })
    }
  }

  protected onFrameLoadedCallbacks: CallbackHandleCollection<[OriginBasedFrameIndex]> =
    new CallbackHandleCollection<[OriginBasedFrameIndex]>()

  /**
   * Triggers event with origin-based frame index.
   *
   * @param cb
   * @returns
   */
  public onFrameLoaded (cb: (frameIndex: OriginBasedFrameIndex) => void): CallbackHandle {
    return this.onFrameLoadedCallbacks.add(cb)
  }

  protected onCleanup: Function[] = []

  public cleanup (): void {
    super.cleanup()
    this.resetFrames()
    this._zeroBasedCurrentFrame = 0
    this.onCleanup.forEach(callback => callback())
    this.framesLoader.cleanup()
    this.onFrameLoadedCallbacks.clear()
    this.onFramesLoaderRelease?.()
    this.onCleanup = []
    this._framesIndexes = new Set()
    this._zeroBasedFramesIndexes = new Set()
  }
}
