import { EditableImagePoint } from '@/engineCommon/point'
import { AnnotationData } from '@/engineV2/models/annotation'

export interface Skeleton extends AnnotationData {
  nodes: SkeletonNode[]
}

export interface SkeletonNode {
  name: string
  point: EditableImagePoint
  occluded: boolean
}
