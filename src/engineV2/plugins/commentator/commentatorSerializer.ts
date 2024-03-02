import { verticesToBoundingBox, boundingBoxToVertices } from '@/engineCommon/comment'
import { AnnotationTypeSerializer } from '@/engineV2/managers'

const commentatorSerializer: AnnotationTypeSerializer = {
  serialize: verticesToBoundingBox,
  deserialize: boundingBoxToVertices
}

export default commentatorSerializer
