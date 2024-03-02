import {
  DatasetItemPayload,
  DatasetItemStatus,
  DatasetPayload,
  StageType,
  WorkflowTemplatePayload
} from '@/store/types'

import { buildDatasetItemPayload } from './buildDatasetItemPayload'
import { buildDatasetPayload } from './buildDatasetPayload'
import { buildWorkflowPayload } from './buildWorkflowPayload'
import {
  buildAnnotateStagePayload,
  buildReviewStagePayload,
  buildCompleteStagePayload,
  buildWorkflowStagePayload
} from './buildWorkflowStagePayload'
import { buildWorkflowStageTemplatePayload } from './buildWorkflowStageTemplatePayload'
import { buildWorkflowTemplatePayload } from './buildWorkflowTemplatePayload'

export const initializeARTemplate = (
  dataset: DatasetPayload = buildDatasetPayload({ id: 1 })
): WorkflowTemplatePayload => {
  return buildWorkflowTemplatePayload({
    dataset_id: dataset.id,
    id: 1,
    name: 'AR',
    workflow_stage_templates: [
      buildWorkflowStageTemplatePayload({
        id: 1,
        name: null,
        stage_number: 1,
        type: StageType.Annotate,
        workflow_template_id: 1
      }),
      buildWorkflowStageTemplatePayload({
        id: 2,
        name: null,
        stage_number: 2,
        type: StageType.Review,
        workflow_template_id: 1
      }),
      buildWorkflowStageTemplatePayload({
        id: 3,
        name: null,
        stage_number: 3,
        type: StageType.Complete,
        workflow_template_id: 1
      })
    ]
  })
}

export const initializeMTemplate = (
  dataset: DatasetPayload = buildDatasetPayload({ id: 1 })
): WorkflowTemplatePayload => {
  return buildWorkflowTemplatePayload({
    dataset_id: dataset.id,
    id: 1,
    name: 'AR',
    workflow_stage_templates: [
      buildWorkflowStageTemplatePayload({
        id: 1,
        name: null,
        stage_number: 1,
        type: StageType.Model,
        workflow_template_id: 1
      }),
      buildWorkflowStageTemplatePayload({
        id: 2,
        name: null,
        stage_number: 2,
        type: StageType.Complete,
        workflow_template_id: 1
      })
    ]
  })
}

/** Automatically instantiate an AR workflow for the specified item and template  */
export const initializeARWorkflow = (
  params: Partial<DatasetItemPayload> = {},
  template: WorkflowTemplatePayload = initializeARTemplate()
): DatasetItemPayload => {
  const workflowId = params.current_workflow_id || 111
  const {
    id: templateId,
    workflow_stage_templates: [stageTemplate1, stageTemplate2, stageTemplate3]
  } = template

  const stage1 = buildAnnotateStagePayload({
    assignee_id: null,
    id: stageTemplate1.id * 100,
    number: 1,
    workflow_id: workflowId,
    workflow_stage_template_id: stageTemplate1.id
  })

  const stage2 = buildReviewStagePayload({
    assignee_id: null,
    id: stageTemplate2.id * 100,
    number: 2,
    workflow_id: workflowId,
    workflow_stage_template_id: stageTemplate2.id
  })

  const stage3 = buildCompleteStagePayload({
    assignee_id: null,
    id: stageTemplate3.id * 100,
    number: 3,
    workflow_id: workflowId,
    workflow_stage_template_id: stageTemplate3.id
  })

  const stages = {
    1: [stage1],
    2: [stage2],
    3: [stage3]
  }

  return buildDatasetItemPayload({
    ...params,
    status: params.status || DatasetItemStatus.annotate,
    current_workflow_id: workflowId,
    current_workflow: {
      id: workflowId,
      current_stage_number: 1,
      current_workflow_stage_template_id: 1,
      dataset_item_id: params.id || 1,
      status: DatasetItemStatus.annotate,
      stages,
      workflow_template_id: templateId
    }
  })
}

// eslint-disable-next-line max-len
export const BASE64_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg=='

export const initializeBlindWorkflow = (): DatasetItemPayload => {
  const base = { dataset_item_id: 1, workflow_id: 5 }
  const annotate1 = buildWorkflowStagePayload({
    ...base,
    id: 11,
    type: StageType.Annotate,
    number: 1,
    workflow_stage_template_id: 100,
    template_metadata: {
      parallel: 2
    }
  })

  const annotate2 = { ...annotate1, id: 12 }

  const test = buildWorkflowStagePayload({
    ...base,
    id: 20,
    type: StageType.Test,
    number: 2,
    workflow_stage_template_id: 200
  })

  const review = buildWorkflowStagePayload({
    ...base,
    id: 30,
    type: StageType.Review,
    number: 3,
    workflow_stage_template_id: 300
  })

  const complete = buildWorkflowStagePayload({
    ...base,
    id: 40,
    type: StageType.Complete,
    number: 4,
    workflow_stage_template_id: 400
  })

  return buildDatasetItemPayload({
    id: 1,
    current_workflow_id: 5,
    status: DatasetItemStatus.review,
    current_workflow: buildWorkflowPayload({
      id: 5,
      stages: {
        1: [annotate1, annotate2],
        2: [test],
        3: [review],
        4: [complete]
      }
    })
  })
}
