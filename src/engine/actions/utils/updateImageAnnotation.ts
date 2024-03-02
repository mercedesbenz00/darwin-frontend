import { Editor } from '@/engine/editor'
import { Annotation } from '@/engine/models'
import { isSkeleton } from '@/engine/plugins/skeleton'
import { SkeletonNode } from '@/engine/plugins/skeleton/types'

export const updateImageAnnotation = (
  editor: Editor,
  annotation: Annotation,
  updateFn: (...args: any[]) => SkeletonNode[],
  ...args: any[]
): Annotation => {
  if (!isSkeleton(annotation.data)) {
    throw new Error('action: expected annotation of skeleton type')
  }
  const nodes = updateFn(annotation.data, ...args)
  return annotation.shallowClone({ data: { ...annotation.data, nodes } })
}
