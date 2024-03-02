import { cloneDeep } from 'lodash'
import { Store } from 'vuex'

import { CallbackHandle, CallbackHandleCollection } from '@/engineCommon/callbackHandler'
import { LoadedFrame, LoadedVideo } from '@/store/modules/workview/types'
import {
  DatasetItemPayload,
  RootState,
  DatasetVideoMetadata,
  LoadedImageWithTiles
} from '@/store/types'

export const belongsToItem = (
  loaded: LoadedImageWithTiles | LoadedVideo,
  item: DatasetItemPayload
): boolean =>
  item.dataset_image
    ? loaded.id === item.dataset_image.image.id
    : !!item.dataset_video_id && loaded.id === item.dataset_video_id

export class ItemManager {
  private onCleanup: Function[] = []

  public currentItem: DatasetItemPayload | null = null

  constructor (private store: Store<RootState>) {
    const unsubscribe = this.store.subscribe(mutation => {
      if (mutation.type === 'workview/SET_SELECTED_DATASET_ITEM') {
        // Current setItem chain is
        // ItemManager > Editor > Layout > View
        this.currentItem = mutation.payload
        this.onItemChangeCallbacks.call(this.currentItem)
      } else if (mutation.type === 'workview/PUSH_VIDEO_FRAMES') {
        this.onVideoChangeCallbacks.call(
          cloneDeep(mutation.payload.loadedFrames),
          cloneDeep(this.store.getters['workview/currentLoadedVideo'])
        )
      }
    })

    this.onCleanup.push(unsubscribe)
  }

  get videoMetadata (): DatasetVideoMetadata | null {
    if (!this.currentItem) { return null }
    if (!this.currentItem.dataset_video) { return null }
    return this.currentItem.dataset_video.metadata
  }

  get isDicomItem (): boolean {
    const { videoMetadata } = this
    return !!videoMetadata && videoMetadata.type === 'dicom'
  }

  get isPdfItem (): boolean {
    const { videoMetadata } = this
    return !!videoMetadata && videoMetadata.type === 'pdf'
  }

  public async loadItem (
    item: DatasetItemPayload | null
  ): Promise<{
    data: LoadedImageWithTiles | LoadedVideo | null
  }> {
    const response: { data: LoadedImageWithTiles | LoadedVideo } | { error: any } =
      await this.store.dispatch('workview/loadItem', item)

    if ('error' in response) {
      await this.store.dispatch('toast/warning', { content: response.error.message })
      return { data: null }
    }

    if ('data' in response) {
      if (!this.currentItem || !belongsToItem(response.data, this.currentItem)) {
        return { data: null }
      }

      return {
        // we need to add properties for tiling, so we need to clone
        data: cloneDeep(response.data)
      }
    }

    return { data: null }
  }

  public async loadVideoItem (
    item: DatasetItemPayload | null
  ): Promise<{
    data: LoadedVideo | null,
    onVideoChange?: (
      cb: (frames: { [key: string]: LoadedFrame }, video: LoadedVideo) => void
    ) => CallbackHandle
  }> {
    const res = await this.loadItem(item)

    if (!res.data) { return { data: null } }

    if ('data' in res) {
      if ('frames' in res.data) {
        return {
          data: res.data,
          onVideoChange: this.onVideoChange.bind(this)
        }
      }
    }

    if (this.store.getters['features/isFeatureEnabled']('DOCUMENTS')) {
      this.store.commit('workview/SET_VIDEO_ANNOTATION_DURATION', 1)
    }

    return { data: null }
  }

  private onItemChangeCallbacks: CallbackHandleCollection<[item: DatasetItemPayload | null]>
    = new CallbackHandleCollection<[item: DatasetItemPayload | null]>();

  onItemChange (cb: (item: DatasetItemPayload | null) => void): CallbackHandle {
    const handle = this.onItemChangeCallbacks.add(cb)

    this.onCleanup.push(handle.release)

    return handle
  }

  private onVideoChangeCallbacks: CallbackHandleCollection<[
    frames: { [key: string]: LoadedFrame },
    video: LoadedVideo
  ]>
    = new CallbackHandleCollection<[frames: { [key: string]: LoadedFrame }, video: LoadedVideo]>();

  private onVideoChange (
    cb: (frames: { [key: string]: LoadedFrame }, video: LoadedVideo) => void
  ): CallbackHandle {
    const handle = this.onVideoChangeCallbacks.add(cb)

    this.onCleanup.push(handle.release)

    return handle
  }

  cleanup (): void {
    this.onCleanup.forEach(callback => callback())
    this.onCleanup = []
    this.onItemChangeCallbacks.clear()
    this.onVideoChangeCallbacks.clear()
  }
}
