import { EditableImagePoint } from '@/engineCommon/point'
import { AnnotationData } from '@/engineV2/models/annotation'
import { AnnotationTypeName } from '@/store/types'

export const ELLIPSE_ANNOTATION_TYPE: AnnotationTypeName = 'ellipse'

export interface Ellipse extends AnnotationData {
  center: EditableImagePoint,
  right: EditableImagePoint,
  top: EditableImagePoint,
  bottom: EditableImagePoint,
  left: EditableImagePoint
}
