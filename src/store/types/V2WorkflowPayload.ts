/* eslint-disable camelcase */

import { AnnotationHotkeysPayload } from '@/store/types/AnnotationHotkeysPayload'
import { V2WorkflowStagePayload } from '@/store/types/V2WorkflowStagePayload'

export type V2Workflows = {
  workflows: V2WorkflowPayload[]
  editedWorkflow: V2WorkflowPayload | null
}

export type V2WorkflowProgressPayload = {
  idle: number
  in_progress: number
  complete: number
  total: number
}

export type V2WorkflowDatasetPayload = {
  annotation_hotkeys: AnnotationHotkeysPayload
  id: number
  instructions: string
  name: string
}

export type V2WorkflowPayload = {
  assigned_items?: number
  config: unknown
  dataset?: V2WorkflowDatasetPayload
  id: string
  inserted_at: string
  name: string
  progress: V2WorkflowProgressPayload
  stages: V2WorkflowStagePayload[]
  status?: string
  thumbnails: string[]
  updated_at: string
}

/* eslint-enable camelcase */
