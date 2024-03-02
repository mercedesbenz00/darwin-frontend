import { DatasetAction } from '@/store/modules/dataset/types'
import { WorkflowStageTemplatePayload } from '@/store/types'
import { updateWorkflowStageTemplate as request } from '@/utils/backend'

type Payload = {
  assignees: { id: number, samplingRate: number }[]
  metadata: WorkflowStageTemplatePayload['metadata']
  name: WorkflowStageTemplatePayload['name']
  stageId: number
}

type Action = DatasetAction<Payload, WorkflowStageTemplatePayload>

export const updateWorkflowStageTemplate: Action = async ({ commit }, payload) => {
  const { assignees, metadata, name } = payload
  const params = {
    id: payload.stageId,
    metadata,
    name,
    workflow_stage_template_assignees: assignees.map(d => ({
      assignee_id: d.id,
      sampling_rate: d.samplingRate
    }))
  }

  const response = await request(params)
  if ('data' in response) { commit('PUSH_WORKFLOW_STAGE_TEMPLATE', response.data) }
  return response
}
