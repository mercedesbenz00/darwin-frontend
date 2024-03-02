import { SkeletonNodeType } from './SkeletonNodeType'

export type SkeletonEdgeType = {
  internalId: string;
  nodes: SkeletonNodeType[]
  isDrawing: boolean
}
