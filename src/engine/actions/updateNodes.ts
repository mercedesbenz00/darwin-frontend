import { Skeleton, SkeletonNode } from '@/engine/plugins/skeleton/types'

export const updateNodes = (skeleton: Skeleton, index: number): SkeletonNode[] => {
  const updatedNodes = []
  for (let i = 0; i < skeleton.nodes.length; i++) {
    const node = skeleton.nodes[i]
    if (i === index) {
      updatedNodes.push({ ...node, occluded: true })
    } else {
      updatedNodes.push(node)
    }
  }
  return updatedNodes
}
