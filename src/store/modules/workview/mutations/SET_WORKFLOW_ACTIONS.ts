import { WorkflowMutation } from '@/store/modules/workview/types'
import { DatasetItemPayload } from '@/store/types/DatasetItemPayload'
import { WorkflowActionPayload } from '@/store/types/WorkflowActionPayload'

type SetWorkflowActionsMutation = WorkflowMutation<{
  actions: WorkflowActionPayload[],
  datasetItem: DatasetItemPayload
}>

export const SET_WORKFLOW_ACTIONS: SetWorkflowActionsMutation = (state, payload) => {
  const { actions, datasetItem } = payload
  const data = state.workflowActions.find(a => a.datasetItemId === datasetItem.id)

  if (data) {
    data.actions = actions
  } else {
    state.workflowActions.push({ datasetItemId: datasetItem.id, actions: actions })
  }
}
