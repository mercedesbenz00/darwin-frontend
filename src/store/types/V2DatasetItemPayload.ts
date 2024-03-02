import { LayoutConfig } from '@/engineV2/layout'

import { DatasetItemStatus } from './DatasetItemStatus'
import { DatasetItemType } from './DatasetItemType'
import { DatasetUploadItemPayloadV2 } from './DatasetUploadItemPayload'
import { StageType } from './StageType'
import { V2DatasetItemSlot } from './V2DatasetItemSlot'
import { WorkflowPayload } from './WorkflowPayload'

export type V2DatasetItemWorkflowStage = {
  /* eslint-disable camelcase */
  assignee_id: number | null
  stage_id: string
  stage_type: StageType
}

export type V2DatasetItemWorkflowData = {
  /* eslint-disable camelcase */
  current_stage_instances: V2DatasetItemWorkflowStage[]
  workflow_id: string
}

export type V2DatasetItemPayload = {
  /* eslint-disable camelcase */
  dataset_id: number
  id: string
  archived: boolean
  slot_types: DatasetItemType[]
  slots: V2DatasetItemSlot[]
  name: string
  path: string
  layout: {
    slots: string[],
    type: LayoutConfig['type'],
    version: number
  },
  priority: number
  processing_status: DatasetItemStatus
  status: DatasetItemStatus
  workflow_status: Exclude<
    DatasetItemStatus,
    DatasetItemStatus.new |
    DatasetItemStatus.processing |
    DatasetItemStatus.uploading
  >
  uploads: DatasetUploadItemPayloadV2[]
  workflow_data?: V2DatasetItemWorkflowData

  current_workflow_id: number | null
  current_workflow: WorkflowPayload | null
  tags?: number[]

  inserted_at: string
  updated_at: string
  /* eslint-enable camelcase */
}
