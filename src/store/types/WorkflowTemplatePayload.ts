import { WorkflowStageTemplatePayload } from './WorkflowStageTemplatePayload'

export type WorkflowTemplatePayload = {
  /* eslint-disable camelcase */
  dataset_id: number
  id: number
  name: string
  workflow_stage_templates: WorkflowStageTemplatePayload[]
  /* eslint-enable camelcase */
}
