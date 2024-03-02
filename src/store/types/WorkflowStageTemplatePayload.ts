import { AnnotationTypeName } from './AnnotationTypeName'
import { StageType } from './StageType'

type ArchiveMetadata = {}

/* eslint-disable camelcase */
type AnnotateMetadata = {
  /**
   * Indicates if anyone can be auto-assigned to this stage,
   * or if it's only available to specific users
   */
  assignable_to?: 'anyone' | 'any_user' | 'manual'

  /**
   * Base sampling rate applied to all users.
   * Multiplied with either assignee's sampling rate, or default `user_sampling_rate`
   */
  base_sampling_rate?: number

  /**
   * Default sampling rate for users.
   *
   * Multiplied with base sampling rate on backend to determine total chance to skip next stage.
   *
   * Used when the user in question is not selected as stage template assignee.
   */
  user_sampling_rate?: number

  /**
   * In case of blind stages, indicating how many parralel annotators there are
   */
  parallel?: number
}

type ReviewMetadata = AnnotateMetadata & {
  /**
   * Indicates if this (review) stage can only be reviewed,
   * or if it can also be annotated by reviewers
   */
  readonly: boolean
}

type ModelMetadata = {

  /**
   * Indicates if a model stage should be auto-instantiated when the item becomes
   * ready. Only valid for model stages which are first in workflow.
   */
  auto_instantiate?: boolean

  // review

  // model

  /**
   * Only if stage is an AI model stage. Id of the associated running session.
   */
  running_session_id?: string

  /**
   * Valid for Model stages. If defined, determines how model classes map to
   * dataset classes.
   *
   * Set durring workflow template creation.
   */
  class_mapping?: { annotation_class_id: number | null, model_class_label: string }[]

  /* eslint-enable camelcase */
}

type TestMetadata = {
  // eslint-disable-next-line camelcase
  type_thresholds: Partial<Record<AnnotationTypeName, number>>
}

type CodeMetadata = {}
type CompleteMetadata = {}
type WebhookMetadata = {}

/* eslint-disable camelcase */

type Base = {
  id: number
  name: string | null

  /** Step this template represents in the workflow */
  stage_number: number

  workflow_template_id: number
  workflow_stage_template_assignees: {
    assignee_id: number
    sampling_rate: number
  }[]
}

export type ArchiveStageTemplatePayload =
  Base & { type: StageType.Archive, metadata: ArchiveMetadata }

export type AnnotateStageTemplatePayload =
  Base & { type: StageType.Annotate, metadata: AnnotateMetadata }

export type ReviewStageTemplatePayload =
  Base & { type: StageType.Review, metadata: ReviewMetadata }

export type CompleteStageTemplatePayload =
  Base & { type: StageType.Complete, metadata: CompleteMetadata }

export type ModelStageTemplatePayload =
  Base & { type: StageType.Model, metadata: ModelMetadata }

export type CodeStageTemplatePayload =
  Base & { type: StageType.Code, metadata: CodeMetadata }

export type TestStageTemplatePayload =
  Base & { type: StageType.Test, metadata: TestMetadata }

export type WebhookStageTemplatePayload =
  Base & { type: StageType.Webhook, metadata: WebhookMetadata }

export type WorkflowStageTemplatePayload =
  ArchiveStageTemplatePayload |
  AnnotateStageTemplatePayload |
  CodeStageTemplatePayload |
  CompleteStageTemplatePayload |
  ModelStageTemplatePayload |
  ReviewStageTemplatePayload |
  TestStageTemplatePayload |
  WebhookStageTemplatePayload

/* eslint-enable camelcase */
