import { AnnotationTypePayload } from '@/store/types'

type Params = Partial<AnnotationTypePayload>

export const buildAnnotationTypePayload = (params: Params = {}): AnnotationTypePayload => ({
  data_skeleton: {},
  description: '',
  granularity: 'main',
  id: -1,
  metadata_skeleton: {},
  name: 'bounding_box',
  subs: [],
  visible: true,
  ...params
})
