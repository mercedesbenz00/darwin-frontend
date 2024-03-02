import { CommentPayload, CommentThreadPayload } from '@/store/types'

import { Comment, CommentThread } from './types'

type CommentThreadNormalized = Omit<CommentThread, 'annotationBoundingBox'>

export const getCommentThread =
  (payload: CommentThreadPayload): CommentThreadNormalized => ({
    authorId: payload.author_id,
    boundingBox: payload.bounding_box,
    commentCount: payload.comment_count,
    frameIndex: payload.frame_index,
    id: payload.id,
    insertedAt: payload.inserted_at,
    isEditable: false,
    isHighlighted: false,
    isMoving: false,
    isSelected: false,
    resolved: payload.resolved,
    updatedAt: payload.updated_at,
    comments: [],
    workflowId: payload.workflow_id
  })

export const getComment = (payload: CommentPayload): Comment => ({
  id: payload.id,
  authorId: payload.author_id,
  body: payload.body,
  commentThreadId: payload.workflow_comment_thread_id,
  insertedAt: payload.inserted_at,
  updatedAt: payload.updated_at
})
