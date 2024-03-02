export type CommentThreadPayload = {
  /* eslint-disable camelcase */
  author_id: number
  bounding_box: {
    x: number
    y: number
    w: number
    h: number
  }
  comment_count: number
  frame_index?: number
  id: number
  inserted_at: string
  resolved: boolean
  updated_at: string
  workflow_id: number
  /* eslint-enable camelcase */
}
