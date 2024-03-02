import { WorkviewAction } from '@/store/modules/workview/types'
import { DatasetItemPayload, LoadingStatus, WorkflowActionPayload } from '@/store/types'
import { loadWorkflowActions as request, LoadWorkflowActionsParams } from '@/utils/backend'

/**
 * Loads all workflow actions for a dataset item
 */
const loadWorkflowActions: WorkviewAction<DatasetItemPayload, WorkflowActionPayload[]> =
  async ({ commit, state }, datasetItem) => {
    commit('SET_WORKFLOW_ACTIONS_LOADING', LoadingStatus.Loading)
    const params: LoadWorkflowActionsParams = { datasetItemId: datasetItem.id }

    const response = state.tutorialMode
      ? { data: [] }
      : await request(params)

    commit('SET_WORKFLOW_ACTIONS_LOADING', LoadingStatus.Loaded)

    if ('data' in response) {
      commit('SET_WORKFLOW_ACTIONS', { datasetItem: datasetItem, actions: response.data })
    }

    return response
  }

export default loadWorkflowActions
