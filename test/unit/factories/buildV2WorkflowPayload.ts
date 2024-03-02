import { StageType, V2WorkflowDatasetPayload, V2WorkflowPayload } from '@/store/types'

import { buildV2WorkflowStagePayload } from '.'

type Params = Partial<V2WorkflowPayload>
type DatasetParams = Partial<V2WorkflowDatasetPayload>

export const buildV2WorkflowPayload = (params: Params = {}): V2WorkflowPayload => {
  const stages = (params.stages || []).map(buildV2WorkflowStagePayload)
  return {
    config: {},
    id: 'foo',
    inserted_at: new Date().toUTCString(),
    name: 'foo',
    progress: { idle: 0, in_progress: 0, complete: 0, total: 0 },
    stages,
    status: 'running',
    thumbnails: [],
    updated_at: new Date().toUTCString(),
    ...params
  }
}

export const buildV2WorkflowDatasetPayload =
  (params: DatasetParams = {}): V2WorkflowDatasetPayload => {
    return {
      annotation_hotkeys: {},
      id: 1,
      name: 'Dataset A',
      instructions: 'Lorem ipsum',
      ...params
    }
  }

export const buildV2DARCWorkflow = (): V2WorkflowPayload => buildV2WorkflowPayload({
  stages: [
    buildV2WorkflowStagePayload({
      id: 'dataset',
      name: 'New',
      type: StageType.Dataset,
      config: { initial: true },
      edges: [{
        id: 'dataset-to-annotate',
        source_stage_id: 'dataset',
        target_stage_id: 'annotate',
        name: 'default'
      }]
    }),
    buildV2WorkflowStagePayload({
      id: 'annotate',
      type: StageType.Annotate,
      edges: [{
        id: 'approve-to-review',
        source_stage_id: 'annotate',
        target_stage_id: 'review',
        name: 'default'
      }]
    }),
    buildV2WorkflowStagePayload({
      id: 'review',
      type: StageType.Review,
      edges: [
        {
          id: 'review-to-complete',
          source_stage_id: 'review',
          target_stage_id: 'complete',
          name: 'approve'
        },
        {
          id: 'review-to-annotate',
          source_stage_id: 'review',
          target_stage_id: 'annotate',
          name: 'reject'
        }
      ]
    }),
    buildV2WorkflowStagePayload({ id: 'complete', type: StageType.Complete }),
    buildV2WorkflowStagePayload({ id: 'discard', type: StageType.Discard })
  ]
})

export const buildLoopedV2DARRCWorkflow = (): V2WorkflowPayload => buildV2WorkflowPayload({
  stages: [
    buildV2WorkflowStagePayload({
      id: 'dataset',
      name: 'New',
      type: StageType.Dataset,
      config: { initial: true },
      edges: [{
        id: 'dataset-to-annotate',
        source_stage_id: 'dataset',
        target_stage_id: 'annotate',
        name: 'default'
      }]
    }),
    buildV2WorkflowStagePayload({
      id: 'annotate',
      type: StageType.Annotate,
      edges: [{
        id: 'approve-to-review',
        source_stage_id: 'annotate',
        target_stage_id: 'review-1',
        name: 'default'
      }]
    }),
    buildV2WorkflowStagePayload({
      id: 'review-1',
      type: StageType.Review,
      edges: [
        {
          id: 'review-1-to-complete',
          source_stage_id: 'review-1',
          target_stage_id: 'complete',
          name: 'approve'
        },
        {
          id: 'review-1-to-review-2',
          source_stage_id: 'review-1',
          target_stage_id: 'review-2',
          name: 'reject'
        }
      ]
    }),
    buildV2WorkflowStagePayload({
      id: 'review-2',
      type: StageType.Review,
      edges: [
        {
          id: 'review-2-to-complete',
          source_stage_id: 'review-2',
          target_stage_id: 'complete',
          name: 'approve'
        },
        {
          id: 'review-2-to-annotate',
          source_stage_id: 'review-2',
          target_stage_id: 'annotate',
          name: 'reject'
        }
      ]
    }),
    buildV2WorkflowStagePayload({ id: 'complete', type: StageType.Complete }),
    buildV2WorkflowStagePayload({ id: 'discard', type: StageType.Discard })
  ]
})
