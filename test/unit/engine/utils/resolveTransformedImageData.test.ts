import { buildRenderableImage } from 'test/unit/factories'

import { resolveTransformedImageData } from '@/engine/utils'

it('works for default image', () => {
  const image = buildRenderableImage()
  const transformedImageData = resolveTransformedImageData(image, [1, 65535], 'default', { type: 'video' })
  expect(transformedImageData).toBeDefined()
})

it('works for dicom image', () => {
  const image = buildRenderableImage()
  const transformedImageData = resolveTransformedImageData(image, [1, 65535], 'default', { type: 'dicom', colorspace: 'RG16' })
  expect(transformedImageData).toBeDefined()
})

it('works for dicom RGB image', () => {
  const image = buildRenderableImage()
  const transformedImageData = resolveTransformedImageData(image, [1, 65535], 'default', { type: 'dicom', colorspace: 'RGB' })
  expect(transformedImageData).toBeDefined()
})

it('works for pdf image', () => {
  const image = buildRenderableImage()
  const transformedImageData = resolveTransformedImageData(image, [1, 65535], 'default', { type: 'pdf' })
  expect(transformedImageData).toBeDefined()
})
