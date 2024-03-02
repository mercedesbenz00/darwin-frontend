import { AnnotationData } from '@/engine/models'
import { EditableImagePoint } from '@/engineCommon/point'
import { AnnotationTypeName } from '@/store/types'

export const BOUNDING_BOX_ANNOTATION_TYPE: AnnotationTypeName = 'bounding_box'

export interface BoundingBox extends AnnotationData {
  topLeft: EditableImagePoint
  topRight: EditableImagePoint
  bottomRight: EditableImagePoint
  bottomLeft: EditableImagePoint
}
