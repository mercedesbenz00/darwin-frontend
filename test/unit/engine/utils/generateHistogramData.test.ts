import { buildImageData } from 'test/unit/factories'

import { generateHistogramData } from '@/engine/utils'

it('works for default image data', () => {
  const imageData: ImageData = buildImageData(100, 100)
  const histogram = generateHistogramData(imageData, { type: 'video' })
  expect(histogram).toBeDefined()
  expect(histogram).toHaveLength(256)
})

it('works for dicom image data (RG16)', () => {
  const imageData: ImageData = buildImageData(100, 100)
  const histogram = generateHistogramData(imageData, { type: 'dicom', colorspace: 'RG16' })
  expect(histogram).toBeDefined()
  expect(histogram).toHaveLength(256 * 32)
})

it('works for dicom image data (RGB)', () => {
  const imageData: ImageData = buildImageData(100, 100)
  const histogram = generateHistogramData(imageData, { type: 'dicom', colorspace: 'RGB' })
  expect(histogram).toBeDefined()
  expect(histogram).toHaveLength(256)
})

it('works for pdf image data', () => {
  const imageData: ImageData = buildImageData(100, 100)
  const histogram = generateHistogramData(imageData, { type: 'pdf' })
  expect(histogram).toBeDefined()
  expect(histogram).toHaveLength(256)
})
