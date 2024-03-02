import { AnnotationData } from '@/engine/models'
import { AnnotationMeasure } from '@/store/types'

export interface Measures extends AnnotationData {
  measures: AnnotationMeasure
}
