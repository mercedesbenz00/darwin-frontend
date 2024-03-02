import { AnnotationData } from '@/engineV2/models'
import { BoundingBox } from '@/engineV2/plugins/boundingBox/types'

export interface BoundingBox3D extends AnnotationData {
  front: BoundingBox
  back: BoundingBox
}
