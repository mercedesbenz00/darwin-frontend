import {
  AnnotateStageConfigPayload,
  CodeStageConfigPayload,
  CompleteStageConfigPayload,
  ConsensusStageConfigPayload,
  DatasetStageConfigPayload,
  DiscardStageConfigPayload,
  ModelStageConfigPayload,
  ReviewStageConfigPayload,
  TestStageConfigPayload,
  V2WorkflowEdgePayload,
  WebhookStageConfigPayload
} from '@/store/types'

import { StageType } from './StageType'

/* eslint-disable camelcase */

export type V2Base = {
  id: string
  name: string
  /** Outgoing edges */
  edges: V2WorkflowEdgePayload[]
}

export type StageCoords = {
  x: number
  y: number
}

export type V2AnnotateStagePayload = V2Base & {
  type: StageType.Annotate
  config: AnnotateStageConfigPayload
  assignable_users: { user_id: number }[]
}

export type V2ReviewStagePayload = V2Base & {
  type: StageType.Review
  config: ReviewStageConfigPayload
  assignable_users: { user_id: number }[]
}

export type V2CompleteStagePayload = V2Base & {
  type: StageType.Complete
  config: CompleteStageConfigPayload
}

export type V2ConsensusStagePayload = V2Base & {
  type: StageType.ConsensusEntrypoint
  config: ConsensusStageConfigPayload
}

export type V2TestStagePayload = V2Base & {
  type: StageType.ConsensusTest
  config: TestStageConfigPayload
}

export type V2DatasetStagePayload = V2Base & {
  type: StageType.Dataset
  config: DatasetStageConfigPayload
}

export type V2DiscardStagePayload = V2Base & {
  type: StageType.Discard
  config: DiscardStageConfigPayload
}

export type V2ModelStagePayload = V2Base & {
  type: StageType.Model
  config: ModelStageConfigPayload
}

export type V2CodeStagePayload = V2Base & {
  type: StageType.Code
  config: CodeStageConfigPayload
}

export type V2WebhookStagePayload = V2Base & {
  type: StageType.Webhook
  config: WebhookStageConfigPayload
}

/**
 * Shape of the backend payload for a single 2.0 Workflow stage.
 *
 * A stage in 2.0 is the equivalent of a workflow stage template in 1.0
 *
 * It's associated to a workflow and is the model for how stage instances are
 * build when a workflow item enters a stage.
 */
export type V2WorkflowStagePayload =
  | V2AnnotateStagePayload
  | V2CompleteStagePayload
  | V2ConsensusStagePayload
  | V2TestStagePayload
  | V2DiscardStagePayload
  | V2DatasetStagePayload
  | V2ReviewStagePayload
  | V2ModelStagePayload
  | V2CodeStagePayload
  | V2WebhookStagePayload

/* eslint-enable camelcase */
