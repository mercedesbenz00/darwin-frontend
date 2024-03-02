import { V2WorkflowItemPayload } from '@/store/types'

import { buildV2WorkflowPayload } from '.'

type Params = Partial<V2WorkflowItemPayload>

export const buildV2WorkflowItemPayload = (params: Params = {}): V2WorkflowItemPayload => ({
  id: 'item-foo',
  current_stage_instances: [],
  dataset_item_id: -1,
  designated_assignees: {},
  workflow_id: 'workflow-foo',
  inserted_at: '2000-01-01T00:00:00',
  updated_at: '2000-01-01T00:00:00',
  workflow: buildV2WorkflowPayload(),
  ...params
})
