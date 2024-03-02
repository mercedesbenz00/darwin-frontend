import { CanvasPoint, EditableImagePoint } from '@/engineCommon/point'
import { Annotation, AnnotationData } from '@/engineV2/models/annotation'
import { AnnotationTypeName } from '@/store/types'

export const DISTANCE_THRESHOLD = 0.5
export const POLYGON_ANNOTATION_TYPE: AnnotationTypeName = 'polygon'

export interface Polygon extends AnnotationData {
  path: EditableImagePoint[]
  additionalPaths?: EditableImagePoint[][]
}

export type AddingPointContext = {
  pointOnLine: CanvasPoint,
  pointOnLineAnnotation: Annotation,
  pointOnLinePath: EditableImagePoint[],
  pointOnLinePosition: number
}
