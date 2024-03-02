import { ReviewStatus } from './ReviewStatus'
import { SkippedReason } from './SkippedReason'
import { StageType } from './StageType'
import {
  AnnotateStageTemplatePayload,
  CodeStageTemplatePayload,
  CompleteStageTemplatePayload,
  ModelStageTemplatePayload,
  ReviewStageTemplatePayload,
  TestStageTemplatePayload,
  WebhookStageTemplatePayload
} from './WorkflowStageTemplatePayload'

/* eslint-disable camelcase */

export type Base = {
  assignee_id: number | null
  dataset_item_id: number
  completed: boolean
  completes_at: number | null
  id: number
  metadata: {
    /**
     * If this is one of several instances of a parallel annotate stage, this
     * indicates this specific instance was sent to next stage.
     */
    ready_for_completion?: boolean
    review_status?: ReviewStatus | null
  }
  number: number
  skipped_reason: SkippedReason
  skipped: boolean

  workflow_id: number
  workflow_stage_template_id: number
}

export type AnnotateStagePayload = Base & {
  type: StageType.Annotate
  template_metadata: AnnotateStageTemplatePayload['metadata']
}

export type ReviewStagePayload = Base & {
  type: StageType.Review
  template_metadata: ReviewStageTemplatePayload['metadata']
}

export type CodeStagePayload = Base & {
  type: StageType.Code
  template_metadata: CodeStageTemplatePayload['metadata']
}

export type ModelStagePayload = Base & {
  type: StageType.Model
  template_metadata: ModelStageTemplatePayload['metadata']
}

export type CompleteStagePayload = Base & {
  type: StageType.Complete
  template_metadata: CompleteStageTemplatePayload['metadata']
}

export type TestStagePayload = Base & {
  type: StageType.Test
  template_metadata: TestStageTemplatePayload['metadata']
}

export type WebhookStagePayload = Base & {
  type: StageType.Webhook
  template_metadata: WebhookStageTemplatePayload['metadata']
}

export type WorkflowStagePayload =
  AnnotateStagePayload |
  CodeStagePayload |
  CompleteStagePayload |
  ModelStagePayload |
  ReviewStagePayload |
  TestStagePayload |
  WebhookStagePayload

/* eslint-enable camelcase */
