import { buildCommentPayload, buildCommentThreadPayload } from 'test/unit/factories'

import { getComment, getCommentThread } from '@/store/modules/comment/serializer'

describe('getComment', () => {
  it('returns Comment from CommentPayload', () => {
    const payload = buildCommentPayload()
    const comment = getComment(payload)
    expect(comment).toEqual({
      id: payload.id,
      authorId: payload.author_id,
      body: payload.body,
      commentThreadId: payload.workflow_comment_thread_id,
      insertedAt: payload.inserted_at,
      updatedAt: payload.updated_at
    })
  })
})

describe('getCommentThread', () => {
  it('returns CommentThread from CommentThreadPayload', () => {
    const payload = buildCommentThreadPayload()
    const comment = getCommentThread(payload)
    expect(comment).toEqual({
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
  })
})
