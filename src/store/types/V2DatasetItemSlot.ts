import { DatasetVideoMetadata, DatasetItemType } from '@/store/types'

export type TiledLevelMap = {
  [key: string]: TiledLevel
}

export type TiledLevel = {
  /* eslint-disable camelcase */
  format: 'png',
  pixel_ratio: number
  tile_height: number
  tile_width: number
  x_tiles: number
  y_tiles: number
  /* eslint-enable camelcase */
}

export type V2DatasetItemSlot = {
  /* eslint-disable camelcase */
  id: string
  file_name: string
  first_section_url?: string
  size_bytes: number
  slot_name: string
  thumbnail_url?: string
  total_sections: number
  metadata?: DatasetVideoMetadata & {
    native_fps: number
    levels: TiledLevelMap
    segment_index: string[]
    width: number
    height: number
  }
  type: DatasetItemType | null
  upload_id: string
  /* eslint-enable camelcase */
}
