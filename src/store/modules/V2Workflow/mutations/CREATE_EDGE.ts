import { v4 } from 'uuid'

import { WorkflowMutation } from '@/store/modules/V2Workflow/types'

/* eslint-disable camelcase */
export type Payload = {
  source_stage_id: string
  target_stage_id: string
  stageId: string
  name?: string
}
/* eslint-enable camelcase */

export const CREATE_EDGE: WorkflowMutation<Payload> = (state, payload) => {
  if (!state.editedWorkflow) { return }
  
  state.editedWorkflow.stages = state.editedWorkflow.stages.map(s => {
    if (s.id === payload.stageId) {
      const uuid = v4()
      const newEdge = {
        id: uuid,
        name: payload.name ?? 'default',
        source_stage_id: payload.stageId,
        target_stage_id: payload.target_stage_id
      }
      return { ...s, edges: [...s.edges, newEdge] }
    } {
      return s
    }
  })

}
