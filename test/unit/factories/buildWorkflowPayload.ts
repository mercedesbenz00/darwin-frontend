import { WorkflowPayload, StageType, DatasetItemStatus } from '@/store/types'

import { buildWorkflowStagePayload } from './buildWorkflowStagePayload'

type Params = Partial<WorkflowPayload>

export const buildWorkflowPayload = (params: Params = {}): WorkflowPayload => ({
  id: 1,
  workflow_template_id: 1,
  dataset_item_id: 1,
  current_workflow_stage_template_id: 1,
  current_stage_number: 1,
  stages: {
    1: [buildWorkflowStagePayload({ id: 1, workflow_stage_template_id: 1, type: StageType.Annotate })],
    2: [buildWorkflowStagePayload({ id: 2, workflow_stage_template_id: 2, type: StageType.Review })],
    3: [buildWorkflowStagePayload({ id: 3, workflow_stage_template_id: 3, type: StageType.Complete })]
  },
  status: DatasetItemStatus.annotate,
  ...params
})
