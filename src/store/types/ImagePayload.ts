/**
 * Defines structure for backend response matching "image.json"
 */
export type ImagePayload = {
  /* eslint-disable camelcase */
  id: number
  key: string
  url: string
  thumbnail_url: string
  upload_url?: string
  height: number
  width: number
  original_filename: string
  external: boolean
  uploaded: boolean
  format?: 'tiled'
  levels?: {
    tile_width: number
    tile_height: number
    x_tiles: number
    y_tiles: number
    pixel_ratio: number
  }[]
  /* eslint-enable camelcase */
}
