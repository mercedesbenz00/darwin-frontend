import { AnnotationData } from '@/engine/models/annotation'
import { EditableImagePoint } from '@/engineCommon/point'
export interface Skeleton extends AnnotationData {
  nodes: SkeletonNode[]
}

export interface SkeletonNode {
  name: string
  point: EditableImagePoint
  occluded: boolean
}
