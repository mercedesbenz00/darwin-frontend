import { V2CommentPayload } from '@/store/types'

type Params = Partial<V2CommentPayload>

export const buildV2CommentPayload = (params: Params = {}): V2CommentPayload => ({
  author_id: -1,
  body: '',
  comment_thread_id: 'fake-thread-id',
  id: 'fake-comment-id',
  inserted_at: '2000-00-00 00:00:00',
  updated_at: '2000-00-00 00:00:00',
  ...params
})
