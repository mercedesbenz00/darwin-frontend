import { SkeletonNodeType } from '@/components/Classes/AnnotationClassDialog/components/SkeletonEditor/engine/types'

type Params = Partial<SkeletonNodeType>

export const buildSkeletonNodeType =
  (params: Params = {}): SkeletonNodeType => ({
    internalId: 'node',
    position: { x: 0, y: 0 },
    label: 'Label',
    isMoving: false,
    isHighlighted: false,
    ...params
  })
