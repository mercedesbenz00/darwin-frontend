import { SkeletonEdgeType } from '@/components/Classes/AnnotationClassDialog/components/SkeletonEditor/engine/types'

import { buildSkeletonNodeType } from './buildSkeletonNodeType'

type Params = Partial<SkeletonEdgeType>

export const buildSkeletonEdgeType =
  (params: Params = {}): SkeletonEdgeType => ({
    internalId: 'edge',
    nodes: [
      buildSkeletonNodeType({ internalId: 'id1' }),
      buildSkeletonNodeType({ internalId: 'id2' })
    ],
    isDrawing: false,
    ...params
  })
