import { Editor } from '@/engine/editor'
import { VideoView } from '@/engine/models'
import { OriginBasedFrameIndex } from '@/engine/models/views/types'
import { loadHqFrame, loadLqFrame } from '@/engine/utils'
import { CallbackHandle, CallbackHandleCollection } from '@/engineCommon/callbackHandler'
import { LoadedFrame, RenderableImage } from '@/store/modules/workview/types'

export class FramesLoader {
  private view: VideoView
  private editor: Editor
  private loading: Map<OriginBasedFrameIndex, Promise<any>> = new Map()

  private currentFrameToLoad: OriginBasedFrameIndex | null = 0
  private nextFrameToLoad: OriginBasedFrameIndex | null = null

  private frames: Map<OriginBasedFrameIndex, LoadedFrame | undefined> = new Map()

  constructor (
    view: VideoView,
    editor: Editor,
    frames: { [key: OriginBasedFrameIndex]: LoadedFrame | undefined } | null = null
  ) {
    this.view = view
    this.editor = editor

    if (frames) {
      this.setFramesToLoad(frames)
    }
  }

  public setFramesToLoad (
    frames: { [key: OriginBasedFrameIndex]: LoadedFrame | undefined }
  ): void {
    this.frames.clear()

    const framesKeys = Object.keys(frames)
    if (framesKeys.length) {
      this.currentFrameToLoad = Infinity

      framesKeys.forEach(key => {
        const index = parseInt(key)
        this.frames.set(parseInt(key), frames[index])

        if (this.currentFrameToLoad === null) { return }

        this.currentFrameToLoad = Math.min(this.currentFrameToLoad, index)
      })

      this.loadFrames()
    }
  }

  public addFramesToLoad (
    frames: { [key: OriginBasedFrameIndex]: LoadedFrame | undefined }
  ): void {
    Object.keys(frames).forEach(key => {
      const index = parseInt(key)
      this.frames.set(parseInt(key), frames[index])
    })

    this.loadFrames()
  }

  public setNextFrameToLoad (index: OriginBasedFrameIndex): Promise<RenderableImage | null> {
    this.nextFrameToLoad = index
    if (this.currentFrameToLoad === null) { this.currentFrameToLoad = index }

    if (!this.loading.has(index)) {
      const promise = this.loadFrame(index).then((res) => {
        this.loading.delete(index)

        this.loadFrames()

        return res
      })

      this.loading.set(index, promise)

      this.frames.delete(index)

      return promise
    }

    return this.loading.get(index) || Promise.resolve(null)
  }

  private onFrameLoadedCallbacks: CallbackHandleCollection<[
    index: OriginBasedFrameIndex,
    frame: LoadedFrame
  ]>
    = new CallbackHandleCollection<[
      index: OriginBasedFrameIndex,
      frame: LoadedFrame
    ]>();

  onFrameLoaded (
    cb: (index: OriginBasedFrameIndex, frame: LoadedFrame) => void
  ): CallbackHandle {
    return this.onFrameLoadedCallbacks.add(cb)
  }

  // index tmp here case `loadHqFrame` requires it
  // for internal video.frame mutation.
  loadHqFrame (frame: LoadedFrame, index: number): Promise<RenderableImage | null> {
    if (!frame) {
      return Promise.resolve(null)
    }

    return loadHqFrame(frame, index, this.view)
  }

  private loadFrames (): void {
    const hardwareConcurrency: number =
      this.editor.store.state.workview.hardwareConcurrency || 2
    while (this.frames.size > 0 && this.loading.size <= hardwareConcurrency) {
      if (this.currentFrameToLoad === null) { return }

      const index = this.currentFrameToLoad

      if (!this.loading.has(index)) {
        this.loading.set(index, this.loadFrame(index)
          .then(() => {
            this.loading.delete(index)
            this.loadFrames()
          })
          .catch(err => console.error(err))
        )
      }

      this.frames.delete(index)

      if (this.frames.size === 0) {
        return
      }

      this.currentFrameToLoad = this.getNextIndex()
    }
  }

  private getNextIndex (): OriginBasedFrameIndex | null {
    if (this.nextFrameToLoad !== null) {
      this.currentFrameToLoad = this.nextFrameToLoad

      this.nextFrameToLoad = null
    }

    if (this.currentFrameToLoad === null) { return null }

    return this.getNextClosestOrNull(this.currentFrameToLoad)
  }

  private getNextClosestOrNull (current: OriginBasedFrameIndex): OriginBasedFrameIndex | null {
    const length = this.frames.size
    for (let i = current + 1; i <= current + length; i++) {
      if (this.frames.has(i)) {
        return i
      }
    }

    return null
  }

  private async loadFrame (
    index: OriginBasedFrameIndex
  ): Promise<RenderableImage | null> {
    const frame = this.frames.get(index)

    if (!frame) {
      return null
    }

    let res = null
    try {
      res = await loadLqFrame(frame, index, this.view)
    } catch {
      return null
    }

    if (this.loading.has(index)) {
      this.onFrameLoadedCallbacks.call(index, frame)
    }

    return res
  }

  public cleanup (): void {
    this.loading.clear()
    this.frames.clear()
    this.currentFrameToLoad = 0
    this.nextFrameToLoad = null
    this.onFrameLoadedCallbacks.clear()
  }
}
