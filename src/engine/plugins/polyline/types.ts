import { Annotation, AnnotationData } from '@/engine/models/annotation'
import { CanvasPoint, EditableImagePoint } from '@/engineCommon/point'
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
