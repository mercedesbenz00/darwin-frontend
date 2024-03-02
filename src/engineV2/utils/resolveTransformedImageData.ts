import { isEqual } from 'lodash'

import { ColorMap, WindowLevels } from '@/engineCommon/imageManipulation'
import { C_MAPS } from '@/engineV2/consts'
import { loadImageData, getWindowLevelsRange } from '@/engineV2/utils'
import { RenderableImage } from '@/store/modules/workview/types'
import { DatasetVideoMetadata } from '@/store/types'

export const windowFunction = (v: number, low: number, high: number): number => {
  if (v <= low) { return 0 }
  if (v >= high) { return 255 }
  return Math.floor((v - low) / (high - low) * 255.0)
}

const handleRGB = (
  image: RenderableImage,
  windowLevels: WindowLevels | null
): CanvasImageSource | null => {
  const { rawData } = image
  if (!rawData) { return null }

  const windowLevelsRange = getWindowLevelsRange('RGB')
  const windowLow = windowLevels ? windowLevels[0] : windowLevelsRange[0]
  const windowHigh = windowLevels ? windowLevels[1] : windowLevelsRange[1]

  // If the window is the full 0-255 range, just return the raw data
  if (windowLow === windowLevelsRange[0] && windowHigh === windowLevelsRange[1]) {
    return image.data
  }

  const { data, width, height } = rawData

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) { return null }

  const buf = new ArrayBuffer(width * height * 4)
  const buf8 = new Uint8ClampedArray(buf)
  for (let i = 0; i < width * height; i++) {
    buf8[i * 4 + 0] = windowFunction(data[i * 4 + 0], windowLow, windowHigh)
    buf8[i * 4 + 1] = windowFunction(data[i * 4 + 1], windowLow, windowHigh)
    buf8[i * 4 + 2] = windowFunction(data[i * 4 + 2], windowLow, windowHigh)
    buf8[i * 4 + 3] = 255
  }
  // we need to first put this into a canvas of the same size as the
  // image before we can draw it on the main canvas (resized)
  const imageData = ctx.createImageData(width, height)
  imageData.data.set(buf8)
  ctx.putImageData(imageData, 0, 0)

  return canvas
}

const getTransformedImageData = (
  image: RenderableImage,
  windowLevels: WindowLevels | null,
  colorMap: ColorMap = 'default',
  videoMetadata: DatasetVideoMetadata | null = null
): CanvasImageSource | null => {
  // Normal images or videos without color mapping
  if ((!videoMetadata || videoMetadata.type !== 'dicom') && colorMap === 'default') {
    return handleRGB(image, windowLevels)
  }

  // DICOMs in RGB space without color mapping
  if (videoMetadata && videoMetadata.colorspace === 'RGB' && colorMap === 'default') {
    return handleRGB(image, windowLevels)
  }

  const { rawData } = image
  if (!rawData) { return null }

  const windowLevelsRange = getWindowLevelsRange(videoMetadata?.colorspace)
  const windowLow = windowLevels ? windowLevels[0] : windowLevelsRange[0]
  const windowHigh = windowLevels ? windowLevels[1] : windowLevelsRange[1]
  const { data, width, height } = rawData

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  const cmap = C_MAPS[colorMap]
  if (!ctx) { return null }

  const area = width * height
  const nimg = new Uint16Array(area)
  if (
    videoMetadata === null ||
    videoMetadata.colorspace === 'RGB' ||
    videoMetadata.colorspace === undefined
  ) {
    if (colorMap !== 'default') {
      // convert to grey scale
      for (let i = 0; i < area; i++) {
        nimg[i] = data[i * 4] * 0.3 + data[i * 4 + 1] * 0.59 + data[i * 4 + 2] * 0.11
      }
    }
  } else if (videoMetadata.colorspace === 'RG16') {
    for (let i = 0; i < area; i++) {
      nimg[i] = (data[i * 4] << 8) | data[i * 4 + 1]
    }
  } else {
    throw new Error(`Unknown colorspace ${videoMetadata.colorspace}`)
  }

  const buf = new ArrayBuffer(width * height * 4)
  const buf8 = new Uint8ClampedArray(buf)
  const bufData = new Uint32Array(buf)
  let max = 0
  let min = Infinity
  for (let y = 0; y < height; ++y) {
    for (let x = 0; x < width; ++x) {
      const v = nimg[y * width + x]
      const sv = windowFunction(v, windowLow, windowHigh)
      if (sv > max) { max = sv }
      if (sv < min) { min = sv }
      // use the window-rescaled input pixel value
      // shifting the same value into r, g and b
      bufData[y * width + x] = cmap[sv]
    }
  }
  // we need to first put this into a canvas of the same size as the
  // image before we can draw it on the main canvas (resized)
  const imageData = ctx.createImageData(width, height)
  imageData.data.set(buf8)
  ctx.putImageData(imageData, 0, 0)

  return canvas
}

export const resolveRawImageData =
  (image: RenderableImage): ImageData | null => image.rawData || loadImageData(image.data)

/**
 * Resolve the window-level applied transformed data
 * @param image renderable image to resolve transfored data
 * @param windowLevels window level from the manipulator
 * @param colorMap color map that we use to generate transformedImageData
 * @param videoMetadata loaded video metadata - if image is loaded, null
 */
export const resolveTransformedImageData = (
  image: RenderableImage,
  windowLevels: WindowLevels | null,
  colorMap: ColorMap = 'default',
  videoMetadata: DatasetVideoMetadata | null = null
): CanvasImageSource | null => {
  const hasWindowLevelsChanged = !isEqual(image.lastWindowLevels, windowLevels)

  // For normal images/videos,
  // we don't need to transform image data with default window levels and color map.
  // For dicom video, we need to always transform image data because
  // it is not what we can draw directly without transformation.
  // Also, if none of window level and color map has changed,
  // we don't need to re-calculate the transformed image.
  if (
    hasWindowLevelsChanged ||
    (videoMetadata && videoMetadata.type === 'dicom' && !image.transformedData)
  ) {
    image.lastWindowLevels = windowLevels
    image.lastColorMap = colorMap
    image.rawData = resolveRawImageData(image)

    if (!image.rawData) {
      image.transformedData = null
      return null
    }
    image.transformedData = getTransformedImageData(image, windowLevels, colorMap, videoMetadata)
  }

  return image.transformedData || image.data
}

export const resolveDicomTransformedImageData = (
  image: RenderableImage,
  windowLevels: WindowLevels | null,
  colorMap: ColorMap = 'default',
  videoMetadata: DatasetVideoMetadata | null = null
): CanvasImageSource | null => {
  const hasWindowLevelsChanged = !isEqual(image.lastWindowLevels, windowLevels)

  // For normal images/videos,
  // we don't need to transform image data with default window levels and color map.
  // For dicom video, we need to always transform image data because
  // it is not what we can draw directly without transformation.
  // Also, if none of window level and color map has changed,
  // we don't need to re-calculate the transformed image.
  if (
    hasWindowLevelsChanged || !image.transformedData
  ) {
    image.lastWindowLevels = windowLevels
    image.lastColorMap = colorMap
    image.rawData = resolveRawImageData(image)

    if (!image.rawData) {
      image.transformedData = null
      return null
    }
    image.transformedData = getTransformedImageData(image, windowLevels, colorMap, videoMetadata)
  }

  return image.transformedData || image.data
}
