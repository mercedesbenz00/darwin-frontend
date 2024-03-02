import { LoadedImage, RenderableImage } from '@/store/modules/workview/types'

export type TileCacheImage = undefined | RenderableImage | 'loading' | 'error' | 'image-error'

/**
 * Extended version of LoadedImage, so it can be used in tiler.ts
 *
 * Defined and used as a separate type because tiles are loaded and stored outside store mutations.
 */
export type LoadedImageWithTiles = LoadedImage & {
  /**
   * Cache of currently loaded image tiles
   */
  cache: { [k: string]: TileCacheImage }
}
