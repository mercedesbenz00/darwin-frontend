import { AnnotationData } from '@/engine/models'

export interface Text extends AnnotationData {
  text: string | null
}
