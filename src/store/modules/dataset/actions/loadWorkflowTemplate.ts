import { DatasetAction } from '@/store/modules/dataset/types'
import { loadWorkflowTemplate as request } from '@/utils/backend'

export const loadWorkflowTemplate: DatasetAction<{ id: number }> = async ({ commit }, params) => {
  const response = await request({ id: params.id })
  if ('data' in response) { commit('PUSH_WORKFLOW_TEMPLATE', response.data) }
  return response
}
