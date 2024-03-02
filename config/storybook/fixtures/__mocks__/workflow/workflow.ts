import { DEVELOPMENT_WORKFLOW_ID } from '@/components/Stages/utils'
import {
  V2WorkflowPayload,
  V2WorkflowDatasetPayload,
  V2WorkflowProgressPayload
} from '@/store/types/V2WorkflowPayload'

const dataset: V2WorkflowDatasetPayload = {
  annotation_hotkeys: {},
  id: 1,
  instructions: 'dataset instructions',
  name: 'dataset'
}

const progress: V2WorkflowProgressPayload = {
  idle: 1,
  in_progress: 10,
  complete: 1,
  total: 12
}

export const workflowBuilder = (params: Partial<V2WorkflowPayload> = {}): V2WorkflowPayload => ({
  assigned_items: 1,
  config: {},
  dataset,
  id: DEVELOPMENT_WORKFLOW_ID,
  inserted_at: new Date().toUTCString(),
  name: 'brain-scan-workflow',
  progress,
  stages: [],
  thumbnails: ['/static/test.png', '/static/test.png', '/static/test.png'],
  updated_at: new Date().toUTCString(),
  ...params
})
