import { WorkviewAction } from '@/store/modules/workview/types'
import { DatasetPayload } from '@/store/types/DatasetPayload'
import {
  loadWorkflowTemplate as backendLoadWorkflowTemplate,
  LoadWorkflowTemplateParams
} from '@/utils/backend'
import { loadWorkflowTemplate as tutorialLoadWorkflowTemplate } from '@/utils/tutorialBackend'

const loadWorkflowTemplate: WorkviewAction<DatasetPayload> = async ({ commit, state }, dataset) => {
  const params: LoadWorkflowTemplateParams = { id: dataset.default_workflow_template_id }

  const response = state.tutorialMode
    ? tutorialLoadWorkflowTemplate(params)
    : await backendLoadWorkflowTemplate(params)

  if ('data' in response) { commit('PUSH_WORKFLOW_TEMPLATE', response.data) }
  return response
}

export default loadWorkflowTemplate
