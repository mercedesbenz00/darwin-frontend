import { boundingBoxToVertices } from '@/engineCommon/comment'
import { getCommentThread } from '@/store/modules/comment/serializer'
import { CommentThread, CommentThreadPayload } from '@/store/types'

type Params = Partial<CommentThreadPayload>

export const buildCommentThread = (params: Params = {}): CommentThread => {
  const p = {
    author_id: -1,
    bounding_box: { x: 1, y: 1, w: 1, h: 1 },
    comment_count: 0,
    id: -1,
    inserted_at: '2000-00-00 00:00:00',
    resolved: false,
    updated_at: '2000-00-00 00:00:00',
    workflow_id: -1,
    ...params
  }
  return {
    ...getCommentThread(p),
    annotationBoundingBox: boundingBoxToVertices(p.bounding_box)
  }
}
