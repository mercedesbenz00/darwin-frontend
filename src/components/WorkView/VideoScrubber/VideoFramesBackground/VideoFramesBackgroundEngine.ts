import debounce from 'lodash/debounce'

import { ZeroBasedFrameIndex } from '@/engine/models/views/types'
import { LoadedVideo } from '@/store/modules/workview/types'

export class VideoFramesBackgroundEngine {
  private canvas?: HTMLCanvasElement
  private frameLineWidth: number | null = null
  private loadedFrames: Set<ZeroBasedFrameIndex> = new Set()
  public width: number = 0
  public height: number = 0
  /**
   * Number of frames to render
   */
  public framesCount: number = 0

  public setFramesCount (value: number): void {
    this.framesCount = value
    this.drawAllFrames()
  }

  /**
   * Total width of the canvas to draw frame lines
   */
  get framesWidth (): number {
    const { framesCount, frameLineWidth } = this
    if (!framesCount || !frameLineWidth) {
      return 0
    }
    return frameLineWidth * framesCount
  }

  public setCanvas (canvas: HTMLCanvasElement): void {
    this.canvas = canvas
    this.drawAllFrames()
  }

  public setFrames (frames: LoadedVideo['frames']): void {
    this.loadedFrames.clear()

    this.drawAllFrames()

    if (frames) {
      window.requestAnimationFrame(() => {
        Object.keys(frames).forEach((key: string) => {
          const index = parseInt(key)
          const frame = frames?.[index]
          const loaded = frame?.hqData || frame?.lqData
          if (loaded) { this.markFrameAsLoaded(index) }
        })
      })
    }
  }

  public setFrameLineWidth (frameLineWidth: number): void {
    this.frameLineWidth = frameLineWidth
    this.drawAllFrames()
  }

  public setHeight (height: number): void {
    this.height = height
    this.drawAllFrames()
  }

  public resetDimensions (): void {
    if (!this.canvas) { return }
    this.width = this.framesWidth || this.canvas.clientWidth
    this.height = this.height || this.canvas.clientHeight
    this.canvas.width = this.width
    this.canvas.style.width = `${this.width}px`
    this.canvas.height = this.height
  }

  /**
   * Draws frame with a different color to mark as loaded.
   * Will keep frame index till frames update.
   *
   * @param frameIndex
   */
  public markFrameAsLoaded (frameIndex: ZeroBasedFrameIndex): void {
    this.loadedFrames.add(frameIndex)

    const { canvas } = this
    if (!canvas) { return }
    const ctx = canvas.getContext('2d')
    if (!ctx) { return }

    ctx.save()
    ctx.fillStyle = '#DAE4ED'
    ctx.beginPath()

    const { frameLineWidth, height } = this
    if (!frameLineWidth) { return }

    const x = frameIndex * frameLineWidth
    const y = 0
    const w = frameLineWidth - 1
    const h = height

    ctx.rect(x, y, w, h)
    ctx.fill()
    ctx.restore()
  }

  private repaintHandle: number | null = null
  /**
   * Draws all frames bars.
   */
  private drawAllFrames (): void {
    this.resetDimensions()
    if (this.repaintHandle) {
      window.cancelAnimationFrame(this.repaintHandle)
    }
    this.repaintHandle = window.requestAnimationFrame(() => {
      this.repaintHandle = null
      const { canvas } = this
      if (!canvas) { return }
      const ctx = canvas.getContext('2d')
      if (!ctx) { return }
      ctx.clearRect(0, 0, this.width, this.height)

      const { frameLineWidth, height } = this
      if (!frameLineWidth) { return }

      const barCanvas = document.createElement('canvas')
      barCanvas.width = frameLineWidth
      const barCtx = barCanvas.getContext('2d')
      if (!barCtx) { return }
      barCtx.beginPath()
      barCtx.fillStyle = '#EBF0F5'
      barCtx.fillRect(0, 0, frameLineWidth - 1, height)

      const pattern = ctx.createPattern(barCanvas, 'repeat')

      if (!pattern) { return }

      ctx.fillStyle = pattern
      ctx.fillRect(0, 0, this.width, this.height)

      this.markExistingFrames()
    })
  }

  private markExistingFrames = debounce(() => {
    this.loadedFrames.forEach((index) => {
      this.markFrameAsLoaded(index)
    })
  }, 100)
}
