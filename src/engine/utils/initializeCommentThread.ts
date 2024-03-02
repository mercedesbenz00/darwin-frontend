import { CommentThread } from '@/engine/models'
import { CommentBoundingBox, CommentVertices } from '@/engineCommon/comment'
/**
 * Initialize a new, unsaved comment thread
 */
export const initializeCommentThread = (
  authorId: number,
  annotationBoundingBox: CommentVertices,
  boundingBox: CommentBoundingBox,
  frameIndex?: number
): CommentThread => ({
  annotationBoundingBox,
  authorId,
  boundingBox,
  commentCount: 0,
  frameIndex,
  id: -1,
  isEditable: true,
  isHighlighted: false,
  isMoving: false,
  isSelected: true,
  comments: [],
  workflowId: -1
})
