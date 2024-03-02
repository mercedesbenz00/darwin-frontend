import { Annotation } from '@/engineV2/models'
import { isSkeleton } from '@/engineV2/plugins/skeleton'
import { SkeletonNode } from '@/engineV2/plugins/skeleton/types'

export const updateImageAnnotation = (
  annotation: Annotation,
  updateFn: (...args: any[]) => SkeletonNode[],
  ...args: any[]
) => {
  if (!isSkeleton(annotation.data)) {
    throw new Error('action: expected annotation of skeleton type')
  }
  const nodes = updateFn(annotation.data, ...args)
  return annotation.shallowClone({ data: { ...annotation.data, nodes } })
}
