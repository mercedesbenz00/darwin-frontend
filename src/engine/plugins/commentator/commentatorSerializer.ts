import { AnnotationTypeSerializer } from '@/engine/managers'
import { verticesToBoundingBox, boundingBoxToVertices } from '@/engineCommon/comment'

const commentatorSerializer: AnnotationTypeSerializer = {
  serialize: verticesToBoundingBox,
  deserialize: boundingBoxToVertices
}

export default commentatorSerializer
