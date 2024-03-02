import { V2SlotSection } from '@/store/types'

import { Actions } from './types'

const hardwareConcurrency = 2

/**
 *
 */
export class FramesLoader {
  /**
   * Keeps active frame loading requests.
   * Supports multiple requests at a time.
   */
  private loading: Map<number, Promise<any>> = new Map()

  /**
   * Current frame index that Loader works with.
   */
  private currentFrameToLoad: number | null = 0
  /**
   * Next frame that Loader will take to work.
   * Supports jumps throw the frames using setNextFrameToLoad.
   */
  private nextFrameToLoad: number | null = null

  /**
   * Keeps all frame indexes that need to be loaded.
   */
  private framesToLoad: Set<number> = new Set()

  /**
   * Cache loaded frames.
   */
  private frames: Map<V2SlotSection['section_index'], string> = new Map()
  /**
   * Keeps frame indexes that were loaded in High Quality.
   * Used to detect when we should not replace this.frames
   * cached value with a lower quality response.
   */
  private hqLoadedIndexes: Set<V2SlotSection['section_index']> = new Set()
  /**
   * Keeps file sections Map to connect indexes with urls.
   */
  private slotSections: Map<number, V2SlotSection> = new Map()

  /**
   * Trick to implement promise for getSectionsByIndex
   * It's polling the variable to catch the time when it gets
   * response after frames request message
   */
  private waitForSection: boolean = false

  /**
   * Push sections to the workers list
   * To get access to the section urls (hq/lq)
   * @param sections
   */
  public pushSections (sections: V2SlotSection[]): void {
    sections.forEach((section) => {
      this.slotSections.set(section.section_index, section)
    })

    this.waitForSection = false

    this.loadFrames()
  }

  /**
   * Clear and sets frame indexes that need to be loaded.
   * @param frames
   * @returns
   */
  public setFramesToLoad (frames: number[]): void {
    this.framesToLoad.clear()

    if (frames.length) {
      this.currentFrameToLoad = Infinity

      this.framesToLoad = new Set([...frames])

      if (this.currentFrameToLoad === null) { return }

      this.currentFrameToLoad = Math.min(...frames)

      this.loadFrames()
    }
  }

  /**
   * Adds array of frame indexes to
   * the list of indexes that need to be loaded.
   * @param frames
   */
  public addFramesToLoad (frames: number[]): void {
    frames.forEach(index => {
      this.framesToLoad.add(index)
    })

    this.loadFrames()
  }

  /**
   * Defines next frame to be loaded.
   * Returns promise of the sought frame.
   */
  public setNextFrameToLoad (index: number): Promise<string | null> {
    this.nextFrameToLoad = index
    if (this.currentFrameToLoad === null) { this.currentFrameToLoad = index }

    if (!this.loading.has(index)) {
      const promise = this.loadFrame(index).then((res) => {
        this.loading.delete(index)

        this.loadFrames()

        return res
      })

      this.loading.set(index, promise)
      this.framesToLoad.delete(index)

      return promise
    }

    return this.loading.get(index) as Promise<string | null>
  }

  public async loadLQFrame (index: number): Promise<string | null> {
    return await this.loadFrame(index, false, true)
  }

  public async loadHQFrame (index: number): Promise<string | null> {
    return await this.loadFrame(index, true, true)
  }

  /**
   * Initialise the frame loading process.
   * Loads all frames from framesToLoad arr
   * with hardwareConcurrency limitation of parallel requests.
   */
  private loadFrames (): void {
    if (this.waitForSection) { return }

    while (this.framesToLoad.size > 0 && this.loading.size <= hardwareConcurrency) {
      if (this.currentFrameToLoad === null) { return }

      const index = this.currentFrameToLoad

      if (!this.loading.has(index)) {
        this.loading.set(
          index,
          this.loadFrame(index)
            .then((res) => {
              this.loading.delete(index)
              this.loadFrames()

              return res
            })
            .catch(err => console.error(err))
        )
      }

      this.framesToLoad.delete(index)

      if (this.framesToLoad.size === 0) {
        return
      }

      this.currentFrameToLoad = this.getNextIndex()
    }
  }

  private getNextIndex (): number | null {
    if (this.nextFrameToLoad !== null) {
      this.currentFrameToLoad = this.nextFrameToLoad

      this.nextFrameToLoad = null
    }

    if (this.currentFrameToLoad === null) { return null }

    return this.getNextClosestOrNull(this.currentFrameToLoad)
  }

  private getNextClosestOrNull (current: number): number | null {
    const length = this.framesToLoad.size
    for (let i = current + 1; i <= current + length; i++) {
      if (this.framesToLoad.has(i)) {
        return i
      }
    }

    return null
  }

  /**
   * Gets frame by it's index
   * By default returns LQ frame
   *
   * @param {number} index - frame index
   * @param {boolean} isHQ - download HQ frame
   * @param {boolean} force - tries to get the frame without checking download queue
   * @returns
   */
  private async loadFrame (
    index: number,
    isHQ: boolean = false,
    force: boolean = false
  ): Promise<string | null> {
    if (this.frames.has(index) && (!isHQ || this.hqLoadedIndexes.has(index))) {
      return this.frames.get(index) as string
    }

    if (
      !force &&
      !this.framesToLoad.has(index) &&
      (!isHQ || this.hqLoadedIndexes.has(index))
    ) {
      return null
    }

    if (!this.slotSections.has(index)) {
      await this.getSectionByIndex(index)
    }

    const section = this.slotSections.get(index)

    if (!section) { throw new Error("Can't get section") }

    let url = isHQ ? section.hq_url : section.lq_url

    if (!url) {
      console.warn(`No ${isHQ ? 'hq' : 'lq'} frame url. Frame index: ${index}`)

      if (!section.hq_url) { throw new Error(`Can't get urls for frame index: ${index}`) }

      isHQ = true
      url = section.hq_url
    }

    let res = null
    try {
      res = await this.loadFrameByUrl(url)

      if (!res) { throw new Error(`Can't get ${isHQ ? 'hq' : 'lq'} frame`) }

      if (!this.hqLoadedIndexes.has(index)) { this.frames.set(index, res) }
      if (isHQ) { this.hqLoadedIndexes.add(index) }

      self.postMessage({
        type: Actions.onFrameLoaded,
        index,
        frameObjectURL: res,
        isHQ
      })
    } catch (e: unknown) {
      console.warn(e)
      return null
    }

    return res
  }

  private async loadFrameByUrl (
    url: string
  ): Promise<string> {
    const imageBlob = await fetch(url)
      .then(response => response.blob())

    return URL.createObjectURL(imageBlob)
  }

  private getSectionByIndex (index: number): Promise<void> {
    this.waitForSection = true

    self.postMessage({
      type: Actions.onGetSection,
      index
    })

    let interval: any

    return new Promise(resolve => {
      interval = setInterval(() => {
        if (this.waitForSection) { return }

        clearInterval(interval)
        resolve()
      }, 100)
    })
  }

  public cleanup (): void {
    this.loading.clear()
    this.framesToLoad.clear()
    this.slotSections.clear()
    this.frames.clear()
    this.hqLoadedIndexes.clear()
    this.currentFrameToLoad = 0
    this.nextFrameToLoad = null
  }
}
