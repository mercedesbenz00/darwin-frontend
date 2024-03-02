import {
  AnnotateStageTemplatePayload,
  CompleteStageTemplatePayload,
  ReviewStageTemplatePayload,
  StageType,
  WorkflowTemplatePayload
} from '@/store/types'

import { dataset } from './dataset'

const annotateTemplate: AnnotateStageTemplatePayload = {
  workflow_stage_template_assignees: [],
  id: 111,
  name: 'Annotate',
  metadata: {
    assignable_to: 'manual',
    base_sampling_rate: 1,
    user_sampling_rate: 1
  },
  stage_number: 1,
  type: StageType.Annotate,
  workflow_template_id: 1
}

const reviewTemplate: ReviewStageTemplatePayload = {
  workflow_stage_template_assignees: [],
  id: 222,
  name: 'Review',
  metadata: {
    assignable_to: 'manual',
    base_sampling_rate: 1,
    readonly: false,
    user_sampling_rate: 1
  },
  stage_number: 2,
  type: StageType.Review,
  workflow_template_id: 1
}

const completeTemplate: CompleteStageTemplatePayload = {
  workflow_stage_template_assignees: [],
  id: 333,
  name: 'Complete',
  metadata: {},
  stage_number: 3,
  type: StageType.Complete,
  workflow_template_id: 1
}

const workflowTemplate: WorkflowTemplatePayload = {
  id: 1,
  dataset_id: dataset.id,
  name: 'default',
  workflow_stage_templates: [annotateTemplate, reviewTemplate, completeTemplate]
}

const workflowTemplates = [workflowTemplate]

export { workflowTemplates }
