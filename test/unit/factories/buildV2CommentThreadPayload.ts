import { V2CommentThreadPayload } from '@/store/types'

type Params = Partial<V2CommentThreadPayload>

export const buildV2CommentThreadPayload = (params: Params = {}): V2CommentThreadPayload => ({
  author_id: -1,
  bounding_box: { x: 1, y: 1, w: 1, h: 1 },
  comment_count: 0,
  dataset_item_id: 'fake-item-id',
  id: 'fake-uuid',
  inserted_at: '2000-00-00 00:00:00',
  resolved: false,
  section_index: null,
  slot_name: 'fake-slot',
  updated_at: '2000-00-00 00:00:00',
  issue_data: null,
  issue_types: null,
  ...params
})
