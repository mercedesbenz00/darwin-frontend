import { CommentPayload } from '@/store/types'

type Params = Partial<CommentPayload>

export const buildCommentPayload = (params: Params = {}): CommentPayload => ({
  author_id: -1,
  body: '',
  workflow_comment_thread_id: -1,
  id: -1,
  inserted_at: '2000-00-00 00:00:00',
  updated_at: '2000-00-00 00:00:00',
  ...params
})
