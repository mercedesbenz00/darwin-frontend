import { CommentPayload } from './CommentPayload'

export type NotificationPayload = {
  /* eslint-disable camelcase */
  comment_id?: number
  comment?: CommentPayload
  id: number
  inserted_at: string
  is_read: boolean
  parsed: string
  task_id: number
  team_id: number
  dataset_id: number
  text: string
  title: string
  type:
    'account_limit_reached' |
    'task_approved' |
    'task_rejected' |
    'task_assigned' |
    'task_ready_for_review' |
    'task_image_comment' |
    'payment_failed' |
    'new_dataset_version' |
    'workflow_image_comment' |
    'work_assigned' |
    'work_rejected' |
    'payment_failed'
  user_id: number
  /* eslint-enable camelcase */
}
