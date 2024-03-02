import { DatasetAction } from '@/store/modules/dataset/types'
import { DatasetPayload } from '@/store/types/DatasetPayload'
import { loadWorkflowTemplates as request } from '@/utils/backend'

export const loadWorkflowTemplates: DatasetAction<DatasetPayload> = async ({ commit }, dataset) => {
  const response = await request({ datasetId: dataset.id })
  if ('data' in response) { commit('PUSH_WORKFLOW_TEMPLATES', response.data) }
  return response
}
