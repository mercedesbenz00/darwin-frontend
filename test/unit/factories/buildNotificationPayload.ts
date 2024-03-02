import { NotificationPayload } from '@/store/types'

import { buildCommentPayload } from './buildCommentPayload'

type Params = Partial<NotificationPayload>

export const buildNotificationPayload =
  (params: Params = {}): NotificationPayload => ({
    comment_id: -1,
    comment: buildCommentPayload(),
    id: 1,
    inserted_at: '2000-01-01',
    is_read: false,
    parsed: 'Task 1 has been assigned',
    text: 'Task 1 has been assigned',
    task_id: 1,
    team_id: -1,
    dataset_id: -1,
    title: 'Test notification',
    type: 'task_assigned',
    user_id: 1,
    ...params
  })
