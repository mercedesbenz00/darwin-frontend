import { AnnotationData } from '@/engineV2/models'

export interface DirectionalVector extends AnnotationData {
  angle: number
  length: number
}
