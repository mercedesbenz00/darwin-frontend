import { v4 as uuid4 } from 'uuid'

import { WorkflowMutation } from '@/store/modules/V2Workflow/types'
import { StageType } from '@/store/types/StageType'
import { V2WorkflowPayload } from '@/store/types/V2WorkflowPayload'
import { V2WorkflowStagePayload } from '@/store/types/V2WorkflowStagePayload'
import { appendNumber } from '@/utils/string'

export const initBasicWorkflow = (
  {
    datasetStageId = uuid4(),
    annotateStageId = uuid4(),
    reviewStageId = uuid4(),
    completeStageId = uuid4(),
    datasetId = null,
    workflowName = 'An unnamed workflow'
  }: {
    datasetId?: number | null;
    datasetStageId?: string;
    annotateStageId?: string;
    reviewStageId?: string;
    completeStageId?: string;
    workflowName?: string;
  } = {}
): V2WorkflowPayload => {
  const datasetStage: V2WorkflowStagePayload = {
    config: {
      initial: true,
      dataset_id: datasetId,
      x: 2942,
      y: 2896
    },
    edges: [{
      id: uuid4(),
      source_stage_id: datasetStageId,
      target_stage_id: annotateStageId,
      name: 'default'
    }],
    id: datasetStageId,
    name: 'Dataset',
    type: StageType.Dataset
  }

  const annotateStage: V2WorkflowStagePayload = {
    assignable_users: [],
    config: {
      assignable_to: 'anyone',
      initial: false,
      x: 3330,
      y: 2896
    },
    edges: [{
      id: uuid4(),
      source_stage_id: annotateStageId,
      target_stage_id: reviewStageId,
      name: 'default'
    }],
    id: annotateStageId,
    name: 'Annotate',
    type: StageType.Annotate
  }

  const reviewStage: V2WorkflowStagePayload = {
    assignable_users: [],
    config: {
      assignable_to: 'anyone',
      initial: false,
      readonly: false,
      x: 3746,
      y: 2896
    },
    edges: [
      {
        id: uuid4(),
        source_stage_id: reviewStageId,
        target_stage_id: completeStageId,
        name: 'approve'
      },
      {
        id: uuid4(),
        source_stage_id: reviewStageId,
        target_stage_id: annotateStageId,
        name: 'reject'
      }
    ],
    id: reviewStageId,
    name: 'Review',
    type: StageType.Review
  }

  const completeStage: V2WorkflowStagePayload = {
    config: {
      x: 4061,
      y: 2896
    },
    edges: [],
    id: completeStageId,
    name: 'Complete',
    type: StageType.Complete
  }

  return {
    id: 'new-workflow',
    status: 'draft',
    config: {},
    name: workflowName,
    stages: [datasetStage, annotateStage, reviewStage, completeStage],
    progress: {
      idle: 0,
      in_progress: 0,
      complete: 0,
      total: 0
    },
    thumbnails: [],
    updated_at: new Date().toUTCString(),
    inserted_at: new Date().toUTCString()
  }
}

export const INITIALIZE_WORKFLOW: WorkflowMutation = (state) => {
  state.editedWorkflow = initBasicWorkflow({
    workflowName: appendNumber(
      'An unnamed workflow',
      state.workflows.map(w => w.name)
    )
  })
}
