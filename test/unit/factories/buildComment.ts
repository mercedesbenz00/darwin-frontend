import { getComment } from '@/store/modules/comment/serializer'
import { Comment, CommentPayload } from '@/store/types'

import { buildCommentPayload } from './buildCommentPayload'

export const buildComment = (params?: Partial<CommentPayload>): Comment =>
  getComment(buildCommentPayload(params))
