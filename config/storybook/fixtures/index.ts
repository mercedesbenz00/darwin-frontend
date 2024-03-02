import {
  AnnotateStageTemplatePayload,
  CodeStageTemplatePayload,
  CompleteStageTemplatePayload,
  ModelStageTemplatePayload,
  ReviewStageTemplatePayload,
  StageType,
  WorkflowStageTemplatePayload,
  WorkflowTemplatePayload
} from '@/store/types'

import * as workflow from './__mocks__/workflow/workflow'
import * as annotationClasses from './annotationClasses'
import * as annotationTypes from './annotationTypes'
import * as bottomBarItems from './bottomBarItems'
import * as datasets from './datasets'
import * as memberships from './memberships'
import * as runningSessions from './runningSessions'
import * as teams from './teams'

const { sfh } = datasets

export {
  annotationClasses,
  annotationTypes,
  bottomBarItems,
  memberships,
  runningSessions,
  teams,
  workflow
}

const baseStageTemplate: Omit<WorkflowStageTemplatePayload, 'type' | 'metadata'> = {
  id: 1,
  name: 'Annotators',
  stage_number: 1,
  workflow_template_id: 7,
  workflow_stage_template_assignees: []
}

const arcAnnotate: WorkflowStageTemplatePayload = {
  ...baseStageTemplate,
  id: 77,
  name: 'Annotate',
  stage_number: 1,
  type: StageType.Annotate,
  metadata: { assignable_to: 'manual', base_sampling_rate: 0, user_sampling_rate: 0 }
}

const arcReview: WorkflowStageTemplatePayload = {
  ...baseStageTemplate,
  id: 88,
  name: 'Review',
  stage_number: 2,
  type: StageType.Review,
  metadata: {
    assignable_to: 'manual',
    base_sampling_rate: 0,
    user_sampling_rate: 0,
    readonly: false
  }

}

const arcComplete: WorkflowStageTemplatePayload = {
  ...baseStageTemplate,
  id: 99,
  name: 'Complete',
  stage_number: 3,
  type: StageType.Complete,
  metadata: {}
}

const arc: WorkflowTemplatePayload = {
  id: 7,
  name: 'AR',
  dataset_id: sfh.id,
  workflow_stage_templates: [
    arcAnnotate,
    arcReview,
    arcComplete
  ]
}

const mmlarcModel1: ModelStageTemplatePayload = {
  ...baseStageTemplate,
  id: 44,
  name: 'OCR',
  stage_number: 1,
  type: StageType.Model,
  metadata: {}
}

const mmlarcModel2: ModelStageTemplatePayload = {
  ...baseStageTemplate,
  id: 55,
  name: 'OCR Phase 2',
  stage_number: 2,
  type: StageType.Model,
  metadata: {}
}

const mmlarcCode: CodeStageTemplatePayload = {
  ...baseStageTemplate,
  id: 66,
  name: 'Transform',
  stage_number: 3,
  type: StageType.Code,
  metadata: {}
}

const mmlarcAnnotate: AnnotateStageTemplatePayload = {
  ...baseStageTemplate,
  id: 77,
  name: 'Annotate',
  stage_number: 4,
  type: StageType.Annotate,
  metadata: { assignable_to: 'anyone', user_sampling_rate: 0, base_sampling_rate: 0.5 }
}

const mmlarcReview: ReviewStageTemplatePayload = {
  ...baseStageTemplate,
  id: 88,
  name: 'Review',
  stage_number: 5,
  type: StageType.Review,
  metadata: {
    assignable_to: 'any_user',
    user_sampling_rate: 2,
    base_sampling_rate: 0.5,
    readonly: true
  }
}

const mmlarcComplete: CompleteStageTemplatePayload = {
  ...baseStageTemplate,
  id: 99,
  name: 'Complete',
  stage_number: 6,
  type: StageType.Complete,
  metadata: {}
}

const mmlarc: WorkflowTemplatePayload = {
  id: 8,
  name: 'MMLARC',
  dataset_id: sfh.id,
  workflow_stage_templates: [
    mmlarcModel1,
    mmlarcModel2,
    mmlarcCode,
    mmlarcAnnotate,
    mmlarcReview,
    mmlarcComplete
  ]
}

sfh.default_workflow_template_id = arc.id

const blindAnnotate: WorkflowStageTemplatePayload = {
  ...baseStageTemplate,
  id: 101,
  name: 'Blind Stage',
  type: StageType.Annotate,
  metadata: {
    assignable_to: 'manual',
    base_sampling_rate: 0,
    user_sampling_rate: 0,
    parallel: 3
  }
}

const blindTest: WorkflowStageTemplatePayload = {
  ...baseStageTemplate,
  id: 102,
  name: 'Automated Test',
  type: StageType.Test,
  metadata: {
    type_thresholds: {
      polygon: 0.95,
      bounding_box: 0.9
    }
  }
}

const blindReview: WorkflowStageTemplatePayload = {
  ...baseStageTemplate,
  id: 103,
  name: 'Reviewers',
  type: StageType.Review,
  metadata: {
    assignable_to: 'manual',
    base_sampling_rate: 0,
    user_sampling_rate: 0,
    readonly: true
  }
}

const blindComplete: WorkflowStageTemplatePayload = {
  ...baseStageTemplate,
  id: 104,
  name: 'Complete',
  type: StageType.Complete,
  metadata: {}
}

const blind: WorkflowTemplatePayload = {
  id: 9,
  name: 'BLIND',
  dataset_id: sfh.id,
  workflow_stage_templates: [
    blindAnnotate,
    blindTest,
    blindReview,
    blindComplete
  ]
}

export const workflowTemplates = { arc, blind, mmlarc }
