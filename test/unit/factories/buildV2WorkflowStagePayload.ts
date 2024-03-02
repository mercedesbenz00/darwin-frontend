import { v4 as uuidv4 } from 'uuid'

import {
  AnnotateStageConfigPayload,
  CompleteStageConfigPayload,
  ConsensusStageConfigPayload,
  DatasetStageConfigPayload,
  DiscardStageConfigPayload,
  ReviewStageConfigPayload,
  WebhookStageConfigPayload,
  StageType,
  TestStageConfigPayload,
  V2AnnotateStagePayload,
  V2CompleteStagePayload,
  V2ConsensusStagePayload,
  V2DatasetStagePayload,
  V2DiscardStagePayload,
  V2ReviewStagePayload,
  V2TestStagePayload,
  V2WorkflowEdgePayload,
  V2WorkflowStagePayload,
  V2WebhookStagePayload
} from '@/store/types'

/**
 * using to create mock data for the frontend. needed until backend is done
 * in order to not get blocked
*/

type AnnotateStageParams = Omit<Partial<V2WorkflowStagePayload>, 'config'> & {
  config?: Partial<AnnotateStageConfigPayload>
}

type ReviewStageParams = Omit<Partial<V2WorkflowStagePayload>, 'config'> & {
  config?: Partial<ReviewStageConfigPayload>
}

type CompleteStageParams = Omit<Partial<V2WorkflowStagePayload>, 'config'> & {
  config?: Partial<CompleteStageConfigPayload>
}

type ConsensusStageParams = Omit<Partial<V2WorkflowStagePayload>, 'config'> & {
  config?: Partial<ConsensusStageConfigPayload>
}

type TestStageParams = Omit<Partial<V2WorkflowStagePayload>, 'config'> & {
  config?: Partial<TestStageConfigPayload>
}

type DatasetStageParams = Omit<Partial<V2WorkflowStagePayload>, 'config'> & {
  config?: Partial<DatasetStageConfigPayload>
}

type DiscardStageParams = Omit<Partial<V2WorkflowStagePayload>, 'config'> & {
  config?: Partial<DiscardStageConfigPayload>
}

type WebhookStageParams = Omit<Partial<V2WebhookStagePayload>, 'config'> & {
  config?: Partial<WebhookStageConfigPayload>
}

type Params =
  | AnnotateStageParams
  | ReviewStageParams
  | ConsensusStageParams
  | TestStageParams
  | CompleteStageParams
  | DatasetStageParams
  | DiscardStageParams
  | WebhookStageParams

const buildAnnotateConfig = (
  params: Partial<AnnotateStageConfigPayload>
): AnnotateStageConfigPayload => {
  const config: AnnotateStageConfigPayload = {
    initial: false,
    x: 0,
    y: 0,
    ...params
  }
  return config
}

const buildReviewConfig = (
  params: Partial<ReviewStageConfigPayload>
): ReviewStageConfigPayload => {
  const config: ReviewStageConfigPayload = {
    initial: false,
    readonly: false,
    x: 0,
    y: 0,
    ...params
  }

  return config
}

const buildCompleteConfig = (
  params: Partial<CompleteStageConfigPayload>
): CompleteStageConfigPayload => {
  return {
    x: 0,
    y: 0,
    ...params
  }
}

const buildDatasetConfig = (
  params: Partial<DatasetStageConfigPayload>
): DatasetStageConfigPayload => {
  return {
    x: 0,
    y: 0,
    dataset_id: -1,
    initial: true,
    ...params
  }
}

const buildDiscardConfig = (
  params: Partial<DiscardStageConfigPayload>
): DiscardStageConfigPayload => {
  return {
    x: 0,
    y: 0,
    ...params
  }
}

const buildConsensusConfig = (
  params: Partial<ConsensusStageConfigPayload>
): ConsensusStageConfigPayload => {
  return {
    x: 0,
    y: 0,
    parallel_stage_ids: [],
    test_stage_id: uuidv4(),
    ...params
  }
}

const buildTestConfig = (
  params: Partial<TestStageConfigPayload>
): TestStageConfigPayload => {
  return {
    x: 0,
    y: 0,
    iou_thresholds: {
      general_threshold: 0.9,
      annotation_classes: [],
      annotation_types: []
    },
    ...params
  }
}

const buildWebhookConfig = (
  params: Partial<WebhookStageConfigPayload>
): WebhookStageConfigPayload => {
  const config: WebhookStageConfigPayload = {
    readonly: true,
    url: '',
    authorization_header: '',
    retry_if_fails: true,
    include_annotations: true,
    x: 0,
    y: 0,
    ...params
  }

  return config
}

export const buildEdgePayload = (
  params: Partial<V2WorkflowEdgePayload>
): V2WorkflowEdgePayload => ({
  id: 'default',
  source_stage_id: 'default',
  target_stage_id: 'target-stage-foo',
  name: 'default',
  ...params
})

const buildV2AnnotateStagePayload = (params: AnnotateStageParams): V2AnnotateStagePayload => {
  // discard original config, edges, type, so they don't override
  const { config, edges, type, ...rest } = params

  const stage: V2AnnotateStagePayload = {
    assignable_users: [],
    config: buildAnnotateConfig(params.config || {}),
    edges: (params.edges || []).map(buildEdgePayload),
    id: 'fake-stage-id',
    name: 'Annotate',
    type: StageType.Annotate,
    ...rest
  }
  return stage
}

const buildV2ReviewStagePayload = (params: ReviewStageParams): V2ReviewStagePayload => {
  // discard original config, edges, type, so they don't override
  const { config, edges, type, ...rest } = params

  const stage: V2ReviewStagePayload = {
    assignable_users: [],
    config: buildReviewConfig(params.config || {}),
    edges: (params.edges || []).map(buildEdgePayload),
    id: 'fake-stage-id',
    name: 'Review',
    type: StageType.Review,
    ...rest
  }
  return stage
}

const buildV2CompleteStagePayload = (params: CompleteStageParams): V2CompleteStagePayload => {
  // discard original config, edges, type, so they don't override
  const { config, edges, type, ...rest } = params

  const stage: V2CompleteStagePayload = {
    config: buildCompleteConfig(params.config || {}),
    edges: (params.edges || []).map(buildEdgePayload),
    id: 'fake-stage-id',
    name: 'Complete',
    type: StageType.Complete,
    ...rest
  }

  return stage
}

const buildV2ConsensusStagePayload = (params: ConsensusStageParams): V2ConsensusStagePayload => {
  // discard original config, edges, type, so they don't override
  const { config, edges, type, ...rest } = params

  const stage: V2ConsensusStagePayload = {
    config: buildConsensusConfig(params.config || {}),
    edges: (params.edges || []).map(buildEdgePayload),
    id: 'fake-stage-id',
    name: 'Consensus',
    type: StageType.ConsensusEntrypoint,
    ...rest
  }

  return stage
}

const buildV2TestStagePayload = (params: TestStageParams): V2TestStagePayload => {
  // discard original config, edges, type, so they don't override
  const { config, edges, type, ...rest } = params

  const stage: V2TestStagePayload = {
    config: buildTestConfig(params.config || {}),
    edges: (params.edges || []).map(buildEdgePayload),
    id: 'fake-stage-id',
    name: 'Test',
    type: StageType.ConsensusTest,
    ...rest
  }

  return stage
}

const buildV2DatasetStagePayload = (params: DatasetStageParams): V2DatasetStagePayload => {
  // discard original config, edges, type, so they don't override
  const { config, edges, type, ...rest } = params

  const stage: V2DatasetStagePayload = {
    config: buildDatasetConfig(params.config || {}),
    edges: (params.edges || []).map(buildEdgePayload),
    id: 'fake-stage-id',
    name: 'Discard',
    type: StageType.Dataset,
    ...rest
  }

  return stage
}

const buildV2DiscardStagePayload = (params: DiscardStageParams): V2DiscardStagePayload => {
  // discard original config, edges, type, so they don't override
  const { config, edges, type, ...rest } = params

  const stage: V2DiscardStagePayload = {
    config: buildDiscardConfig(params.config || {}),
    edges: (params.edges || []).map(buildEdgePayload),
    id: 'fake-stage-id',
    name: 'Discard',
    type: StageType.Discard,
    ...rest
  }

  return stage
}

const buildV2WebhookStagePayload = (params: WebhookStageParams): V2WebhookStagePayload => {
  // discard original config, edges, type, so they don't override
  const { config, edges, type, ...rest } = params

  const stage: V2WebhookStagePayload = {
    config: buildWebhookConfig(params.config || {}),
    edges: (params.edges || []).map(buildEdgePayload),
    id: 'fake-stage-id',
    name: 'Webhook',
    type: StageType.Webhook,
    ...rest
  }

  return stage
}

const isAnnotateStage = (params: Params): params is AnnotateStageParams =>
  (params.type || StageType.Annotate) === StageType.Annotate

const isDatasetStage = (params: Params): params is DatasetStageParams =>
  params.type === StageType.Dataset

const isReviewStage = (params: Params): params is ReviewStageParams =>
  params.type === StageType.Review

const isCompleteStage = (params: Params): params is CompleteStageParams =>
  params.type === StageType.Complete

const isConsensusStage = (params: Params): params is ConsensusStageParams =>
  params.type === StageType.ConsensusEntrypoint

const isTestStage = (params: Params): params is TestStageParams =>
  params.type === StageType.ConsensusTest

const isDiscardStage = (params: Params): params is DiscardStageParams =>
  params.type === StageType.Discard

const isWebhookStage = (params: Params): params is WebhookStageParams =>
  params.type === StageType.Webhook

export const buildV2WorkflowStagePayload = (params: Params = {}): V2WorkflowStagePayload => {
  if (isDatasetStage(params)) {
    return buildV2DatasetStagePayload(params)
  }

  if (isAnnotateStage(params)) {
    return buildV2AnnotateStagePayload(params)
  }

  if (isReviewStage(params)) {
    return buildV2ReviewStagePayload(params)
  }

  if (isCompleteStage(params)) {
    return buildV2CompleteStagePayload(params)
  }

  if (isConsensusStage(params)) {
    return buildV2ConsensusStagePayload(params)
  }

  if (isTestStage(params)) {
    return buildV2TestStagePayload(params)
  }

  if (isDiscardStage(params)) {
    return buildV2DiscardStagePayload(params)
  }

  if (isWebhookStage(params)) {
    return buildV2WebhookStagePayload(params)
  }

  throw new Error('Invalid stage given')
}
