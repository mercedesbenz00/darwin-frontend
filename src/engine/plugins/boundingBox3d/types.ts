import { AnnotationData } from '@/engine/models'
import { BoundingBox } from '@/engine/plugins/boundingBox/types'

export interface BoundingBox3D extends AnnotationData {
  front: BoundingBox
  back: BoundingBox
}
