import { WorkflowTemplatePayload, StageType } from '@/store/types'

import { buildWorkflowStageTemplatePayload } from './buildWorkflowStageTemplatePayload'

type Params = Partial<WorkflowTemplatePayload>

export const buildWorkflowTemplatePayload =
  (params: Params = {}): WorkflowTemplatePayload => ({
    dataset_id: -1,
    id: -1,
    name: 'AR',
    workflow_stage_templates: [
      buildWorkflowStageTemplatePayload({ id: 1, type: StageType.Annotate, stage_number: 1 }),
      buildWorkflowStageTemplatePayload({ id: 2, type: StageType.Review, stage_number: 2 }),
      buildWorkflowStageTemplatePayload({ id: 3, type: StageType.Complete, stage_number: 3 })
    ],
    ...params
  })
