export type CommentPayload = {
  /* eslint-disable camelcase */
  id: number
  author_id: number
  body: string
  frame_index?: number
  workflow_comment_thread_id: number
  inserted_at: string,
  updated_at: string
  /* eslint-enable camelcase */
}
