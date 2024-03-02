import { AnnotationData } from '@/engineV2/models'

export interface Text extends AnnotationData {
  text: string | null
}
