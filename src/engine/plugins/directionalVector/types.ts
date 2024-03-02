import { AnnotationData } from '@/engine/models'

export interface DirectionalVector extends AnnotationData {
  angle: number
  length: number
}
