import { EditablePoint } from '@/engineCommon/point'
import { AnnotationTypeSerializer } from '@/engineV2/managers'
import { AnnotationData, SkeletonData } from '@/engineV2/models/annotation'

import { isSkeleton } from './utils'

export const skeletonSerializer: AnnotationTypeSerializer<SkeletonData> = {
  serialize (data: AnnotationData): any {
    if (!isSkeleton(data)) {
      throw new Error('skeleton: expected annotation of skeleton type')
    }
    const nodes = data.nodes.map(node => ({
      x: node.point.x,
      y: node.point.y,
      name: node.name,
      occluded: node.occluded
    }))
    return { skeleton: { nodes } }
  },

  deserialize (rawData: any) {
    const nodes = rawData.skeleton.nodes.map((node: SkeletonData['nodes'][0]) => ({
      point: new EditablePoint<'Image'>({ x: node.x, y: node.y }),
      name: node.name,
      occluded: node.occluded
    }))

    return { nodes }
  }
}
