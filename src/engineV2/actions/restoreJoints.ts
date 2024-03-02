import { Skeleton, SkeletonNode } from '@/engineV2/plugins/skeleton/types'

export const restoreJoints = (skeleton: Skeleton): SkeletonNode[] =>
  skeleton.nodes.map(node => ({ ...node, occluded: false }))
