import { AnnotationData } from '@/engineV2/models'
import { AnnotationMeasure } from '@/store/types'

export interface Measures extends AnnotationData {
  measures: AnnotationMeasure
}
