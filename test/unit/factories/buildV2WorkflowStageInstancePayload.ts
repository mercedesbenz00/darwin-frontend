import { V2InstanceStatus, V2WorkflowStageInstancePayload } from '@/store/types'

import { buildV2WorkflowStagePayload } from './buildV2WorkflowStagePayload'

type Params = Partial<V2WorkflowStageInstancePayload>

export const buildV2WorkflowStageInstancePayload = (
  params: Params = {}
): V2WorkflowStageInstancePayload => {
  const { stage: stageParams, ...rest } = params
  const stage = buildV2WorkflowStagePayload(stageParams)
  return ({
    id: 'foo',
    item_id: 'bar',
    stage_id: params.stage_id || params.stage?.id || 'baz',
    user_id: null,
    model_id: null,
    status: V2InstanceStatus.Current,
    stage,
    data: {
      skipped: false,
      exit_snapshot_id: null,
      active_edge: null,
      scheduled_to_complete_at: null
    },
    ...rest
  })
}
