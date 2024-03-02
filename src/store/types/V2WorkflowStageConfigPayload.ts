/* eslint-disable camelcase */

import { AnnotationTypeName } from '@/store/types/AnnotationTypeName'
import { StageCoords } from '@/store/types/V2WorkflowStagePayload'

export type AnnotateStageConfigPayload = {
  initial: boolean
  annotation_group_id?: string | null
  /**
   * Indicates if anyone can be auto-assigned to this stage,
   * or if it's only available to specific users
   */
  assignable_to?: 'anyone' | 'manual'
} & StageCoords

export type ReviewStageConfigPayload = AnnotateStageConfigPayload & {
  /**
   * Indicates if this (review) stage can only be reviewed,
   * or if it can also be annotated by reviewers
   */
  readonly: boolean,
  assignable_to?: 'anyone' | 'manual'
} & StageCoords

export type CompleteStageConfigPayload = {} & StageCoords

export type ConsensusStageConfigPayload = {
  parallel_stage_ids: string[],
  test_stage_id: string,
} & StageCoords

export type TestStageConfigPayload = {
  iou_thresholds: {
    general_threshold: number
    annotation_classes: {
      annotation_class_id: number
      threshold: number
      annotation_subtypes: string[]
    }[]
    annotation_types: {
      annotation_type: AnnotationTypeName
      threshold: number
    }[]
  }
} & StageCoords

export type DatasetStageConfigPayload = {
  dataset_id: number | null
  initial: boolean
} & StageCoords

export type DiscardStageConfigPayload = {} & StageCoords

export type ModelStageClassMapping = {
  annotation_class_id: number | null,
  model_class_label: string
}

export type ModelStageConfigPayload = {
  auto_instantiate: boolean,
  /* Using the same types as in WF1 to be compatible with class mapping dialog */
  class_mapping: ModelStageClassMapping[],
  model_id: string,
} & StageCoords

export type CodeStageConfigPayload = AnnotateStageConfigPayload & {
  readonly: boolean
} & StageCoords

export type WebhookStageConfigPayload = {
  readonly: boolean,
  url: string,
  authorization_header?: string,
  retry_if_fails?: boolean
  include_annotations?: boolean
} & StageCoords

/* eslint-enable camelcase */
