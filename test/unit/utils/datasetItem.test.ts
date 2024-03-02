import {
  buildDatasetItemPayload,
  buildDatasetImagePayload,
  buildDatasetVideoPayload
} from 'test/unit/factories'

import { isImageItem } from '@/utils'

describe('isImageItem', () => {
  const imageItem = buildDatasetItemPayload({
    dataset_image: buildDatasetImagePayload({}),
    dataset_video: null
  })
  const videoItem = buildDatasetItemPayload({
    dataset_image: null,
    dataset_video: buildDatasetVideoPayload({})
  })
  it('works', () => {
    expect(isImageItem(imageItem)).toBe(true)
    expect(isImageItem(videoItem)).toBe(false)
  })
})
