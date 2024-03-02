import { AnnotationPayload } from '@/store/types'

type Params = Partial<AnnotationPayload>

export const buildAnnotationPayload = (params: Params = {}): AnnotationPayload => ({
  annotation_class_id: -1,
  data: { polygon: [{ x: 1, y: 1 }, { x: 2, y: 2 }] },
  ...params
})
