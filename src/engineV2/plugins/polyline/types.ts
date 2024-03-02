import { CanvasPoint, EditableImagePoint } from '@/engineCommon/point'
import { Annotation, AnnotationData } from '@/engineV2/models/annotation'
import { AnnotationTypeName } from '@/store/types'

export const POLYLINE_ANNOTATION_TYPE: AnnotationTypeName = 'line'

export interface Polyline extends AnnotationData {
  path: EditableImagePoint[];
}

export type AddingPointContext = {
  pointOnLine: CanvasPoint
  pointOnLineAnnotation: Annotation
  pointOnLinePosition: number
  pointOnLinePath: EditableImagePoint[]
}
