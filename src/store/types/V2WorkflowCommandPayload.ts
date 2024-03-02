/* eslint-disable camelcase */

import { SkippedReason } from './SkippedReason'

export type AssignCommand = {
  id: string
  type: 'assign'
  user_id: number
  data: {
    assignee_id: number
    stage_id: string
  }
}

export type CancelCommand = {
  id: string
  type: 'cancel'
  user_id: number,
  data: {}
}

export type TransitionViaEdgeCommand = {
  id: string
  type: 'transition_via_edge'
  user_id: number
  data: {
    delay_ms?: number
    edge?: string
    stage_id: string
  }
}

export type SetStageCommand = {
  id: string
  type: 'set_stage'
  user_id: number
  data: {
    to_stage_id: string
  }
}

export type SkipCommand = {
  id: string
  type: 'skip'
  user_id: number
  data: {
    delay_ms?: number
    stage_id: string
    reason: SkippedReason
  }
}

export type CreateAnnotationCommand = {
  id: string
  type: 'create_annotation'
  data: {
    annotation_class_id: number
    annotation_group_id: string | null,
    annotation_id: string
    data: object
    metadata: {}
    stage_id: string
    z_index: number | null
  }
}

export type UpdateAnnotationCommand = {
  id: string
  type: 'update_annotation'
  data: {
    annotation_class_id: number
    annotation_id: string
    data: object
    metadata: {}
    stage_id: string
    z_index: number | null
  }
}

export type DeleteAnnotationCommand = {
  id: string
  type: 'delete_annotation'
  data: {
    annotation_id: string
    stage_id: string
  }
}

export type V2WorkflowCommandPayload =
  | AssignCommand
  | CreateAnnotationCommand
  | DeleteAnnotationCommand
  | CancelCommand
  | SetStageCommand
  | SkipCommand
  | TransitionViaEdgeCommand
  | UpdateAnnotationCommand
