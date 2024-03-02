import { V2InstanceStatus } from '@/store/types'

import { SkippedReason } from './SkippedReason'
import { UserPayload } from './UserPayload'
import { V2WorkflowStagePayload } from './V2WorkflowStagePayload'

/* eslint-disable camelcase */
export type V2WorkflowStageInstancePayload = {
  id: string
  item_id: string
  stage_id: string
  stage: V2WorkflowStagePayload
  status: V2InstanceStatus,
  user_id: UserPayload['id'] | null
  model_id: string | null
  data: {
    active_edge: string | null
    exit_snapshot_id?: string | null
    scheduled_to_complete_at: string | null
    skipped: boolean,
    skipped_reason?: SkippedReason
  }
}
