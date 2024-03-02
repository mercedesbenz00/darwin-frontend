import { ImagePayload } from '@/store/types'

type Params = Partial<ImagePayload>

export const buildImagePayload = (params: Params): ImagePayload => ({
  id: -1,
  key: 'foo',
  url: '/originals/foo',
  external: false,
  thumbnail_url: '/thumbnails/foo',
  height: 1,
  width: 1,
  original_filename: 'foo.png',
  uploaded: true,
  ...params
})
