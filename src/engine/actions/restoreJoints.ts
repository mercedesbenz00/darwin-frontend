import { Skeleton, SkeletonNode } from '@/engine/plugins/skeleton/types'

export const restoreJoints = (skeleton: Skeleton): SkeletonNode[] =>
  skeleton.nodes.map(node => ({ ...node, occluded: false }))
