import EventEmitter from 'events'

import { Store } from 'vuex'

import { View } from '@/engineV2/views'
import { FramesLoaderWorker } from '@/engineV2/workers/FramesLoaderWorker'
import { loadItemV2 } from '@/store/modules/workview/actions/loadItem'
import { RenderableImage } from '@/store/modules/workview/types'
import {
  RootState,
  DatasetItemType,
  V2SlotSection,
  StoreActionResponse
} from '@/store/types'
import { V2DatasetItemPayload } from '@/store/types/V2DatasetItemPayload'
import { V2DatasetItemSlot } from '@/store/types/V2DatasetItemSlot'
import { resolveVariable } from '@/utils/config'

type GetLQOptions = {
  fallbackHQFrame: boolean
}

const DEFAULT_SECTIONS_SIZE = 500

/**
 * @event file:loading
 * @event file:loaded
 * @event frame:loaded
 */
export class FileManager extends EventEmitter {
  private view: View
  private lqLoadedIndexes: Set<V2SlotSection['section_index']> = new Set()
  private hqLoadedIndexes: Set<V2SlotSection['section_index']> = new Set()
  private slotSections: Map<number, V2SlotSection> = new Map()

  private framesLoaderWorker: FramesLoaderWorker

  private _file: V2DatasetItemSlot
  public get file (): V2DatasetItemSlot {
    return this._file
  }

  private set file (val: V2DatasetItemSlot) {
    this._file = val
  }

  private _item: V2DatasetItemPayload
  public get item (): V2DatasetItemPayload {
    return this._item
  }

  private set item (val: V2DatasetItemPayload) {
    this._item = val
  }

  public get imageWidth (): number | null {
    return this.slotSections.get(0)?.width || null
  }

  public get imageHeight (): number | null {
    return this.slotSections.get(0)?.height || null
  }

  constructor (view: View, file: V2DatasetItemSlot, item: V2DatasetItemPayload) {
    super()

    this.view = view
    this._file = file
    this._item = item

    this.framesLoaderWorker = new FramesLoaderWorker()

    this.framesLoaderWorker.onFrameLoaded((index: number, _, isHQ: boolean) => {
      this.lqLoadedIndexes.add(index)
      if (isHQ) { this.hqLoadedIndexes.add(index) }
      this.emit('frame:loaded', index)
    })

    this.framesLoaderWorker.onGetSection(async (index: number) => {
      await this.loadFilePage(this.resolveSectionsOffset(index))
    })

    this.emit('file:loading')

    this.loadFilePage().then(() => {
      this.emit('file:loaded', this.slotSections)
    })
  }

  public loadFrames (): void {
    if (this.isTiled) { throw new Error("Can't run frames loader for tiled iamge file!") }
    this.framesLoaderWorker.setFramesToLoad(this.framesIndexes)
  }

  private get store (): Store<RootState> {
    return this.view.store
  }

  public loadFramesFrom (index: number): Promise<RenderableImage | null> {
    return this.framesLoaderWorker.setNextFrameToLoad(index)
      .then((objectURL: string | undefined) => {
        if (!objectURL) { return null }

        return this.resolveImage(objectURL)
      })
  }

  public isFrameLoaded (index: number): boolean {
    return this.lqLoadedIndexes.has(index)
  }

  public isHQFrameLoaded (index: number): boolean {
    return this.hqLoadedIndexes.has(index)
  }

  public get framesIndexes (): number[] {
    return [...new Array(this.file.total_sections)].map((_, i) => i)
  }

  get loadedFramesIndexes (): number[] {
    return [...this.lqLoadedIndexes.keys()]
  }

  get totalSections (): number {
    return this.file.total_sections
  }

  get fileId (): string {
    return this.file.id
  }

  get filename (): string {
    return this.file.file_name
  }

  get slotName (): string {
    return this.file.slot_name
  }

  get metadata (): V2DatasetItemSlot['metadata'] | null {
    return this.file.metadata || null
  }

  get fps (): number {
    return this.metadata?.native_fps || 24
  }

  get isImage (): boolean {
    return this.file.type === DatasetItemType.image
  }

  get isVideo (): boolean {
    return this.file.type === DatasetItemType.video
  }

  get isDicom (): boolean {
    return this.file.type === DatasetItemType.dicom
  }

  get isPdf (): boolean {
    return this.file.type === DatasetItemType.pdf
  }

  get isTiled (): boolean {
    return this.file.type === DatasetItemType.image && !!this.file.metadata?.levels
  }

  get isProcessedAsVideo (): boolean {
    return this.isPdf || this.isVideo || this.isDicom
  }

  async getSection (index: number): Promise<V2SlotSection> {
    if (this.slotSections.has(index)) {
      return Promise.resolve(this.slotSections.get(index) as V2SlotSection)
    }

    await this.loadFilePage(this.resolveSectionsOffset(index))

    return this.getSection(index)
  }

  async getLQFrame (
    frameIndex: number = 0,
    options?: GetLQOptions
  ): Promise<RenderableImage | null> {
    const frame = await this.framesLoaderWorker.loadLQFrame(frameIndex)

    if (!frame) {
      console.warn("Can't get lq frame")

      if (options?.fallbackHQFrame) {
        return this.getHQFrame(frameIndex)
      }

      return null
    }

    return this.resolveImage(frame)
  }

  async getHQFrame (frameIndex: number = 0): Promise<RenderableImage | null> {
    const frame = await this.framesLoaderWorker.loadHQFrame(frameIndex)

    if (!frame) { throw new Error("Can't get hq frame") }

    return this.resolveImage(frame)
  }

  public getStreamUrl (): string {
    const currentTeam = this.store.state.team.currentTeam
    if (!currentTeam) { throw new Error("Can't get currentTeam!") }

    const baseURL = resolveVariable(process.env.VUE_APP_BASE_API, '$BASE_API') as string
    const teamSlug = currentTeam.slug
    const itemId = this.item.id
    const fileSlotName = this.file.slot_name
    return `${baseURL}/v2/teams/${teamSlug}/items/${itemId}/slots/${fileSlotName}/stream/sign`
  }

  private loadFileRequest: Promise<any> | null = null

  private async loadFilePage (offset: number = 0): Promise<void> {
    if (this.loadFileRequest) {
      return this.loadFileRequest
    }

    this.loadFileRequest = this.store.dispatch(
      'workview/loadItemV2',
      {
        item: this.item,
        file: this.file,
        page: {
          offset,
          size: DEFAULT_SECTIONS_SIZE
        }
      }
    )

    const response: StoreActionResponse<typeof loadItemV2> = await this.loadFileRequest

    this.loadFileRequest = null

    if ('error' in response) { return }
    if (!response.data) { return }

    this.framesLoaderWorker.pushSections(response.data.slot_sections)

    response.data.slot_sections.forEach(section => {
      this.slotSections.set(section.section_index, section)
    })
  }

  private resolveImage (objectURL: string | undefined): Promise<RenderableImage | null> {
    if (!objectURL) { return Promise.resolve(null) }

    const img = new Image()

    img.src = objectURL

    const lastWindowLevels: [number, number] = this.metadata?.default_window
      ? [
        this.metadata.default_window.min,
        this.metadata.default_window.max
      ]
      : [0, 0]

    return new Promise((resolve, reject) => {
      img.onload = (): void => {
        img.onload = null
        img.onerror = null

        const data: any = {
          data: img,
          rawData: null,
          transformedData: null,
          lastWindowLevels,
          lastColorMap: 'default'
        }

        resolve(data)
      }

      img.onerror = (e): void => reject(e)
    })
  }

  private resolveSectionsOffset (index: number): number {
    return Math.floor(index / DEFAULT_SECTIONS_SIZE) * DEFAULT_SECTIONS_SIZE
  }

  cleanup (): void {
    this.lqLoadedIndexes.clear()
    this.hqLoadedIndexes.clear()
    this.framesLoaderWorker.cleanup()
    this.slotSections.clear()
  }
}
