import { CommentBoundingBox, CommentVertices } from '@/engineCommon/comment'

export type Comment = {
  /**
   * ID of Comment
   *
   * @type {number}
   * @memberof Comment
   */
  id: number;

  /**
   * Author user ID
   *
   * @type {number}
   * @memberof Comment
   */
  authorId: number;

  body: string;

  commentThreadId: number

  insertedAt: string;

  updatedAt: string;
}

export type CommentThread = {
  id: number;

  authorId: number;
  commentCount: number;
  resolved?: boolean;
  frameIndex?: number;

  /**
   * Usually immutable bounding box received as part of the backend payload.
   *
   * Gets copied into mutable `annotationBoundigBox`
   */
  boundingBox: CommentBoundingBox;

  /**
   * Active, "mutable" bounding box which is modified by plugins as the thread is moved around.
   */
  annotationBoundingBox: CommentVertices;

  insertedAt?: string;

  updatedAt?: string;

  /** Only one comment thread can be selected at any given time */
  isSelected: boolean;
  /** Several comment threads can be highlited at the same time */
  isHighlighted: boolean;
  isMoving: boolean;

  /**
   * Indicates if comment thread is editable (can be moved or bounding box resized)
   *
   * Is only true for a new comment thread, before it's persisted to backend.
   */
  isEditable: boolean;

  comments: Comment[]
  workflowId: number
}
