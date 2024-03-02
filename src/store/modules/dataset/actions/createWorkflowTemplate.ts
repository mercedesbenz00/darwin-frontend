import { DatasetAction } from '@/store/modules/dataset/types'
import { StageType, WorkflowTemplatePayload } from '@/store/types'
import { createWorkflowTemplate as request } from '@/utils/backend'

type Action = DatasetAction<Omit<WorkflowTemplatePayload, 'name'>>

export const createWorkflowTemplate: Action = async ({ commit }, workflowTemplate) => {
  const params = {
    dataset_id: workflowTemplate.dataset_id,
    workflow_stage_templates:
      workflowTemplate.workflow_stage_templates
        .filter(t => t.type !== StageType.Complete)
        .map(t => ({
          metadata: t.metadata,
          name: t.name,
          stage_number: t.stage_number,
          type: t.type,
          workflow_stage_template_assignees: t.workflow_stage_template_assignees
        }))
  }

  const response = await request(params)
  if ('data' in response) { commit('PUSH_WORKFLOW_TEMPLATE', response.data) }
  return response
}
