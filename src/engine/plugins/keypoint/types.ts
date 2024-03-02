import { AnnotationData } from '@/engine/models'

export interface Keypoint extends AnnotationData {
  x: number
  y: number
}
