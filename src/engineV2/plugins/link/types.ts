import { AnnotationData } from '@/engineV2/models'

export const LINK_ANNOTATION_TYPE = 'link'

export interface Link extends AnnotationData {
  from: string
  to: string
}
