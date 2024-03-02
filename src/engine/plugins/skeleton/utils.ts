import { Annotation, AnnotationData } from '@/engine/models'
import { IView } from '@/engine/models/views/types'

import { Skeleton } from './types'

export const isSkeleton = (annotationData: AnnotationData): annotationData is Skeleton => {
  return 'nodes' in annotationData
}

export const getPath = (annotation: Annotation, view: IView) => {
  let skeleton: Skeleton
  if (annotation.isVideoAnnotation()) {
    const { data } = annotation.inferVideoData(view)
    if (!isSkeleton(data)) {
      return []
    }
    skeleton = data
  } else {
    if (!isSkeleton(annotation.data)) {
      return []
    }
    skeleton = annotation.data
  }
  return skeleton.nodes.map(node => node.point)
}
