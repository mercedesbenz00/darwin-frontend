import { V2WorkflowItemStatePayload } from '@/store/types'

import { buildV2DARCWorkflow, buildV2WorkflowStageInstancePayload } from '.'

type Params = Partial<V2WorkflowItemStatePayload>

export const buildV2WorkflowItemStatePayload = (
  params: Params = {}
): V2WorkflowItemStatePayload => {
  const {
    current_stage_instances: instanceParams = [],
    workflow: workflowParams,
    ...rest
  } = params
  const instances = instanceParams.map(buildV2WorkflowStageInstancePayload)

  return {
    item_id: 'fake-item-state-id',
    current_stage_instances: instances,
    previous_stage_instances: [],
    designated_assignees: {},
    commands: [],
    workflow: buildV2DARCWorkflow(),
    ...rest

  }
}
