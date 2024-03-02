import { getWindowLevelsRange } from '@/engine/utils'
import { Camera } from '@/engineCommon/camera'
import { RenderableImage } from '@/store/modules/workview/types'
import { ApiResponse } from '@/store/types'
import { post } from '@/utils/api'

import { LoadedImageWithTiles, TileCacheImage } from './annotation'

const clamp = (value: number, min: number, max: number): number => {
  if (value > max) { return max }
  if (value < min) { return min }
  return value
}

const imageKey = (x: number, y: number, z: number): string => `${z}#${y}#${x}`

type Tile = {
  rx: number,
  ry: number,
  cx: number,
  cy: number,
  w: number,
  h: number,
  key: string,
  z: number,
  image: () => TileCacheImage
}

type TileRequestEntry = {
  x: number,
  y: number,
  z: number,
  request: Promise<string>
  resolve: (url: string) => void
  reject: (error: any) => void
}

// maybe move out?
type RepaintCallback = () => void

export const isRenderableImage = (image: TileCacheImage): image is RenderableImage => {
  if (!image) { return false }
  if (typeof image === 'string' || !('data' in image)) { return false }
  return (image as RenderableImage).data instanceof HTMLImageElement
}

/**
 * Retrieve tiles for a specified zoom level
 */
const getTilesForZoomLevel = (
  image: LoadedImageWithTiles,
  camera: Camera,
  zoomLevel: number
): Tile[] => {
  const tileW = image.levels[zoomLevel].tile_width
  const tileH = image.levels[zoomLevel].tile_height

  const unitsPerPixel = image.levels[zoomLevel].pixel_ratio

  // how many tiles does this zoom level have?
  const numHorizontalTiles = image.levels[zoomLevel].x_tiles
  const numVerticalTiles = image.levels[zoomLevel].y_tiles

  const offset = camera.getOffset()
  const scale = camera.scale
  const canvasWidth = camera.width
  const canvasHeight = camera.height

  // left/right/top/bottom - most tile indexes for the current zoom level
  const left = Math.floor(offset.x / (tileW * scale * unitsPerPixel))
  const right = Math.ceil((canvasWidth + offset.x) / (tileW * scale * unitsPerPixel)) - 1
  const top = Math.floor(offset.y / (tileH * scale * unitsPerPixel))
  const bottom = Math.ceil((canvasHeight + offset.y) / (tileH * scale * unitsPerPixel)) - 1

  // useful for debugging:
  // console.debug(`zoom: ${zoomLevel}, tiles X: ${left}::${right}, tiles Y: ${top}::${bottom}`)

  const visibleTiles = []
  for (let x = left; x <= right; x++) {
    if (x < 0 || x >= numHorizontalTiles) { continue }

    for (let y = top; y <= bottom; y++) {
      if (y < 0 || y >= numVerticalTiles) { continue }

      const key = imageKey(x, y, zoomLevel)

      visibleTiles.push({
        rx: x,
        ry: y,
        z: zoomLevel,
        cx: x * tileW * scale * unitsPerPixel,
        cy: y * tileH * scale * unitsPerPixel,
        w: tileW * scale * unitsPerPixel,
        h: tileH * scale * unitsPerPixel,
        key: key,
        image: () => image.cache[key]
      })
    }
  }

  return visibleTiles
}

/**
 * Retrieve max zoom level for image
 */
const getMaxImageZoomLevel = (image: LoadedImageWithTiles): number => {
  const maxLevelStr =
    Object.keys(image.levels)
      .filter((key) => key !== 'base_key')
      .reduce((a, b) => image.levels[a] > image.levels[b] ? a : b)

  return parseInt(maxLevelStr)
}

/**
 * Capture image loading requests so the url can be requested
 * from the backend before being loaded into the cache,
 *
 * This is done by putting all request inside tileRequestEntries,
 * together with a promise to resolve them.
 *
 * SIDE EFFECT: Pushes entry into specified tileRequestEntries
 */
const createTileRequestEntry =
  (image: LoadedImageWithTiles, tile: Tile): TileRequestEntry | void => {
    const { rx: x, ry: y, z, key } = tile
    const data = image.cache[key]
    // don't load if the image is already loading or has been loaded
    if (data === 'loading' || image.cache[key] !== undefined) { return }
    image.cache[key] = 'loading'

    const entry: Partial<TileRequestEntry> = { x, y, z }

    entry.request = new Promise((resolve, reject) => {
      entry.resolve = resolve
      entry.reject = reject
    })

    return entry as TileRequestEntry
  }

/**
 * Schedule tiles to load when the url for them is received
 *
 * Loading is done by creating an HTML Image element and setting
 * its src attribute to the value of the resolved URL
 */
const scheduleTileLoad = async (
  image: LoadedImageWithTiles,
  entry: TileRequestEntry,
  requestRepaint: RepaintCallback
): Promise<void> => {
  const key = imageKey(entry.x, entry.y, entry.z)
  let url: string

  try {
    url = await entry.request
  } catch (error: unknown) {
    image.cache[key] = 'error'
    return
  }

  const htmlImage = new Image()
  htmlImage.crossOrigin = 'anonymous'
  htmlImage.onload = (): void => {
    image.cache[key] = {
      data: htmlImage,
      rawData: null,
      transformedData: null,
      lastWindowLevels: getWindowLevelsRange(),
      lastColorMap: 'default'
    }
    requestRepaint()
  }

  htmlImage.onerror = (): void => {
    image.cache[key] = 'image-error'
  }

  htmlImage.src = url
}

/**
 * Cleanup image tile cache.
 *
 * Keeps at least 15 images in cache.
 *
 * For amounts > 15 images, any cache keys which aren't part of the listed
 * visible tiles are discadred, unless they are currently being loaded or
 * haven't started loading (undefined) yet.
 *
 * Errored requests are also cleaned up, so they can be retried
 *
 * NOTE: 15 images ~ 100 mb of ram.
 */
const cleanUpTileCache = (image: LoadedImageWithTiles, visibleTiles: Tile[]): void => {
  if (Object.keys(image.cache).length <= 15 + visibleTiles.length) { return }

  const visibleKeys = new Set(visibleTiles.map((tile) => tile.key))
  for (const key of Object.keys(image.cache)) {
    // do not remove unloaded tiles or tiles in the progress of loading
    if (image.cache[key] === 'loading' || image.cache[key] === undefined) { continue }

    // do not remove visible tiles
    if (visibleKeys.has(key)) { continue }

    const value = image.cache[key]
    if (value instanceof HTMLImageElement) { value.remove() }
    delete image.cache[key]
  }
}

/**
 * Resolve tile request entries by dispatching a backend request
 *
 * A single request to get a list of tile urls is dispatched.
 *
 * Each tile request entry is then matched with a specific url for that tile
 * from the response and the associated entry promise is resolved.
 */
const resolveTileRequests =
  async (image: LoadedImageWithTiles, tiles: TileRequestEntry[]): Promise<void> => {
    if (tiles.length === 0) { return }

    // eslint-disable-next-line camelcase
    const params: { tiles: TileRequestEntry[], task_id?: number } = { tiles }
    if (image.taskId) { params.task_id = image.taskId }

    let response: ApiResponse<{ [k in string]: string }>
    try {
      response = await post(`dataset_images/${image.datasetImageId}/tiles`, params)
    } catch (error: unknown) {
      for (const { reject } of tiles) { reject(error) }
      return
    }

    const { data } = response
    for (const { x, y, z, resolve } of tiles) {
      const key = imageKey(x, y, z)
      const url = data[key]
      resolve(url)
    }
  }

/**
 * Start retrieval visible tiles for an image within the current camera context
 *
 * As tiles are retrieved, automatic repaint is triggered
 */
export const getVisibleTiles =
  (image: LoadedImageWithTiles, camera: Camera, requestRepaint: RepaintCallback): Tile[] => {
    if (image.cache === undefined) { image.cache = {} }

    const tileRequestEntries: TileRequestEntry[] = []

    const scale = camera.scale
    // the highest zooming out level
    const maxLevel = getMaxImageZoomLevel(image)

    // Each zoom level halves the amount of scale they cover
    // For example level: 0 (1px = 1px), is between 100% - 50%
    //             level: 1 (2px = 1px)  is between  50% - 25%
    const currentZoomLevel = clamp(Math.round(-Math.log(scale) / Math.log(2)), 0, maxLevel)

    const visibleTiles: Tile[] = []

    if (currentZoomLevel < maxLevel) {
      for (let level = maxLevel; level > currentZoomLevel; level--) {
      // keep old tiles at higher zoom in memory for smooth zoom in / zoom out
      // always load the most zoomed out image
        const tiles = getTilesForZoomLevel(image, camera, level)

        if (maxLevel === level) {
          tiles.forEach(t => {
            const entry = createTileRequestEntry(image, t)
            if (entry) {
              scheduleTileLoad(image, entry, requestRepaint)
              tileRequestEntries.push(entry)
            }
          })
        }

        visibleTiles.push(...tiles)
      }
    }

    const tiles = getTilesForZoomLevel(image, camera, currentZoomLevel)
    tiles.forEach(t => {
      const entry = createTileRequestEntry(image, t)
      if (entry) {
        scheduleTileLoad(image, entry, requestRepaint)
        tileRequestEntries.push(entry)
      }
    })

    visibleTiles.push(...tiles)

    cleanUpTileCache(image, visibleTiles)
    resolveTileRequests(image, tileRequestEntries)
    return visibleTiles
  }
