import { DatasetAction } from '@/store/modules/dataset/types'
import { WorkflowTemplatePayload } from '@/store/types/WorkflowTemplatePayload'
import {
  setDefaultWorkflowTemplate as request,
  SetDefaultWorkflowTemplateParams
} from '@/utils/backend'

export const setDefaultWorkflowTemplate: DatasetAction<WorkflowTemplatePayload> =
  async ({ commit }, workflowTemplate) => {
    const params: SetDefaultWorkflowTemplateParams = {
      datasetId: workflowTemplate.dataset_id,
      workflowTemplateId: workflowTemplate.id
    }
    const response = await request(params)
    if ('data' in response) {
      commit('UPDATE_DATASET_DEFAULT_WORKFLOW_TEMPLATE', response.data)
    }
    return response
  }
