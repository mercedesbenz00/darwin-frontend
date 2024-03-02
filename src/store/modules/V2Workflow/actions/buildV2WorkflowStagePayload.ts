import { v4 as uuidv4 } from 'uuid'

import {
  DatasetStageConfigPayload,
  ModelStageConfigPayload,
  StageType,
  V2AnnotateStagePayload,
  V2CompleteStagePayload,
  V2ConsensusStagePayload,
  V2TestStagePayload,
  V2DatasetStagePayload,
  V2DiscardStagePayload,
  V2ModelStagePayload,
  V2ReviewStagePayload,
  V2WorkflowEdgePayload,
  V2WorkflowStagePayload,
  V2WebhookStagePayload
} from '@/store/types'
import {
  AnnotateStageConfigPayload,
  CompleteStageConfigPayload,
  ConsensusStageConfigPayload,
  TestStageConfigPayload,
  DiscardStageConfigPayload,
  ReviewStageConfigPayload,
  WebhookStageConfigPayload
} from '@/store/types/V2WorkflowStageConfigPayload'

type AnnotateStageParams = Omit<Partial<V2WorkflowStagePayload>, 'config'> & {
  // eslint-disable-next-line camelcase
  assignable_users?: { user_id: number }[]
  config?: Partial<AnnotateStageConfigPayload>
}

type ReviewStageParams = Omit<Partial<V2WorkflowStagePayload>, 'config'> & {
  // eslint-disable-next-line camelcase
  assignable_users?: { user_id: number }[]
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

type DiscardStageParams = Omit<Partial<V2WorkflowStagePayload>, 'config'> & {
  config?: Partial<DiscardStageConfigPayload>
}

type ModelStageParams = Omit<Partial<V2WorkflowStagePayload>, 'config'> & {
  config?: Partial<ModelStageConfigPayload>
}

type DatasetStageParams = Omit<Partial<V2DatasetStagePayload>, 'config'> & {
  config?: Partial<DatasetStageConfigPayload>
}

type WebhookStageParams = Omit<Partial<V2WebhookStagePayload>, 'config'> & {
  config?: Partial<WebhookStageConfigPayload>
}

type Params = AnnotateStageParams
| ReviewStageParams
| CompleteStageParams
| ConsensusStageParams
| DatasetStageParams

const buildAnnotateConfig = (
  params: Partial<AnnotateStageConfigPayload>
): AnnotateStageConfigPayload => {
  const config: AnnotateStageConfigPayload = {
    assignable_to: 'anyone',
    initial: false,
    x: 0,
    y: 0,
    ...params
  }
  return config
}

const buildReviewConfig = (params: Partial<ReviewStageConfigPayload>): ReviewStageConfigPayload => {
  const config: ReviewStageConfigPayload = {
    assignable_to: 'anyone',
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
      annotation_types: [],
    },
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

const buildModelConfig = (params: Partial<ModelStageConfigPayload>): ModelStageConfigPayload => {
  return {
    auto_instantiate: false,
    class_mapping: [],
    model_id: '',
    x: 0,
    y: 0,
    ...params
  }
}

const buildDatasetConfig = (
  params: Partial<DatasetStageConfigPayload>
): DatasetStageConfigPayload => {
  return {
    initial: true,
    dataset_id: null,
    x: 0,
    y: 0,
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

const buildEdgePayload = (params: Partial<V2WorkflowEdgePayload>): V2WorkflowEdgePayload => ({
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

const buildV2ModelStagePayload = (params: ModelStageParams): V2ModelStagePayload => {
  // discard original config, edges, type, so they don't override
  const { config, edges, type, ...rest } = params

  const stage: V2ModelStagePayload = {
    config: buildModelConfig(params.config || {}),
    edges: (params.edges || []).map(buildEdgePayload),
    id: 'fake-stage-id',
    name: 'AI Model',
    type: StageType.Model,
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

const buildV2DatasetStagePayload = (params: DatasetStageParams): V2DatasetStagePayload => {
  const { config, edges, type, ...rest } = params

  const stage: V2DatasetStagePayload = {
    config: buildDatasetConfig(params.config || {}),
    edges: (params.edges || []).map(buildEdgePayload),
    id: 'fake-stage-id',
    name: 'Dataset',
    type: StageType.Dataset,
    ...rest
  }

  return stage
}

const isAnnotateStage = (params: Params): params is AnnotateStageParams =>
  (params.type || StageType.Annotate) === StageType.Annotate

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

const isModelStage = (params: Params): params is ModelStageParams => params.type === StageType.Model

const isDatasetStage = (params: Params): params is DatasetStageParams =>
  params.type === StageType.Dataset

const isWebhookStage = (params: Params): params is WebhookStageParams =>
  params.type === StageType.Webhook

export const buildV2WorkflowStagePayload = (
  params: Params = {}
  /*
  * Needs to be seperate due to id type variation.
  * Weird and hard to fix this string | number stuff
  * */
): V2WorkflowStagePayload | V2DatasetStagePayload => {
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

  if (isModelStage(params)) {
    return buildV2ModelStagePayload(params)
  }

  if (isDatasetStage(params)) {
    return buildV2DatasetStagePayload(params)
  }

  if (isWebhookStage(params)) {
    return buildV2WebhookStagePayload(params)
  }

  throw new Error('Invalid stage given')
}
