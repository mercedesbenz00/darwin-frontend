import { DatasetVideoMetadata } from '@/store/types'

export function generateHistogramData (
  imageData: ImageData,
  metadata: DatasetVideoMetadata | null = null
) {
  const is16Bit = metadata && metadata.colorspace === 'RG16'
  const histogram = new Uint32Array(is16Bit ? 256 * 32 : 256)
  const data = imageData.data
  const area = data.length / 4
  // How many pixels are we going to look at (max 50 000)
  const pixels = Math.min(area, 50000)
  // How spread out the samples are
  const step = Math.max(1, Math.floor(area / pixels))

  for (let i = 0; i < area; i += step) {
    if (is16Bit) {
      histogram[Math.floor(((data[i * 4] << 8) | data[i * 4 + 1]) / 8)] += 1
    } else {
      histogram[
        Math.floor(data[i * 4] * 0.3 + data[i * 4 + 1] * 0.59 + data[i * 4 + 2] * 0.11)
      ] += 1
    }
  }
  return histogram
}
