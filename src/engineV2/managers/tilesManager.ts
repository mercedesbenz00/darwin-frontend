import { EventEmitter } from 'events'

import { TileCacheImage, LoadedImageWithTiles } from '@/engineV2/models'
import { Tile, getVisibleTiles } from '@/engineV2/models/tiler'
import { TiledView } from '@/engineV2/views'
import { loadItemV2 } from '@/store/modules/workview/actions/loadItem'
import { StoreActionResponse } from '@/store/types'
import { TilesRequestPayload } from '@/utils/backend/loadFile'

/**
 * @event tiles:loaded
 */
export class TilesManager extends EventEmitter {
  private tilesUrls: { [k: string]: string } = {}
  private tiles: { [k: string]: TileCacheImage } = {}

  constructor (private view: TiledView) {
    super()
  }

  public get imageWidth (): number {
    return this.view.fileManager.imageWidth || 0
  }

  public get imageHeight (): number {
    return this.view.fileManager.imageHeight || 0
  }

  private get tiledImage (): Partial<LoadedImageWithTiles> {
    return {
      width: this.imageWidth,
      height: this.imageHeight,

      /** Only available if the full image has been loaded (not just metadata) */
      data: this.view.currentFrame,

      levels: this.view.fileManager.metadata?.levels,

      cache: this.tiles
    }
  }

  public async getTiles (tiles: TilesRequestPayload): Promise<{ [k in string]: string }> {
    const response: StoreActionResponse<typeof loadItemV2> = await this.view.store.dispatch(
      'workview/loadItemV2',
      {
        item: this.view.fileManager.item,
        file: this.view.fileManager.file,
        tiles
      }
    )

    if ('error' in response) { return {} }

    if (!response.data?.slot_sections?.[0]?.tile_urls) { return {} }

    this.tilesUrls = response.data.slot_sections[0].tile_urls

    this.emit('tiles:loaded')

    return this.tilesUrls
  }

  public getVisibleTiles (): Tile[] {
    return getVisibleTiles(this.tiledImage, this.view, () => {
      this.view.mainLayer.changed()
    })
  }

  public cleanup (): void {
    this.tilesUrls = {}
    this.tiles = {}
  }
}
