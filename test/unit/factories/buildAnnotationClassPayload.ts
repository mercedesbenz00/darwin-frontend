import { AnnotationClassPayload } from '@/store/types'

type Params = Partial<AnnotationClassPayload>

export const buildAnnotationClassPayload = (params: Params): AnnotationClassPayload => ({
  annotation_types: ['polygon'],
  description: '',
  id: -1,
  datasets: [],
  images: [],
  inserted_at: new Date().toISOString(),
  metadata: { _color: 'rgba(0, 0, 0, 0.1)' },
  name: 'Flask',
  team_id: -1,
  ...params
})

export const buildAnnotationClassImagePayload = (
  params: Partial<AnnotationClassPayload['images'][0]>
): AnnotationClassPayload['images'][0] => ({
  key: 'foo_key',
  crop_key: 'crop_key',
  original_image_url: 'original_foo',
  crop_url: 'crop_foo',
  id: 'fake-uuid',
  x: 1,
  y: 1,
  image_height: 1000,
  image_width: 1000,
  scale: 1,
  index: 0,
  ...params
})
