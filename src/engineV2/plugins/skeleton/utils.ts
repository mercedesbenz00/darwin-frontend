import { Annotation, AnnotationData } from '@/engineV2/models'
import { View } from '@/engineV2/views'

import { Skeleton } from './types'

export const isSkeleton = (annotationData: AnnotationData): annotationData is Skeleton => {
  return 'nodes' in annotationData
}

export const getPath = (annotation: Annotation, view: View) => {
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
