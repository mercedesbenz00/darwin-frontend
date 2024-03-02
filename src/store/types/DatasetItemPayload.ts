import { DatasetImagePayload } from './DatasetImagePayload'
import { DatasetItemStatus } from './DatasetItemStatus'
import { DatasetItemType } from './DatasetItemType'
import { DatasetVideoPayload } from './DatasetVideoPayload'
import { SkippedReason } from './SkippedReason'
import { V2WorkflowItemPayload } from './V2WorkflowItemPayload'
import { WorkflowPayload } from './WorkflowPayload'

export type DatasetItemPayload = {
  /* eslint-disable camelcase */
  archived_reason: SkippedReason
  archived: boolean
  current_workflow_id: number | null
  current_workflow: WorkflowPayload | null
  dataset_id: number
  dataset_image_id: number | null
  dataset_image: DatasetImagePayload | null
  dataset_video_id: number | null
  dataset_video: DatasetVideoPayload | null
  file_size: number
  filename: string
  height: number
  id: number
  inserted_at: string
  labels: number[]
  path: string
  priority: number
  seq: number
  set: number
  status: DatasetItemStatus
  type: DatasetItemType
  updated_at: string
  width: number
  workflow_item?: V2WorkflowItemPayload | null
  /* eslint-enable camelcase */
}
