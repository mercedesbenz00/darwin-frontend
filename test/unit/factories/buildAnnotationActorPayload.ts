import { AnnotationActorPayload } from '@/store/types'

export const buildAnnotationActorPayload = (
  params?: Partial<AnnotationActorPayload>
): AnnotationActorPayload => ({
  role: 'annotator',
  user_id: 1,
  ...params
})
