import { cloneDeep } from 'lodash'

import { WorkflowMutation } from '@/store/modules/V2Workflow/types'

export const CLONE_WORKFLOW_TO_EDITED: WorkflowMutation<string> = (state, workflowId) => {
  const workflow = cloneDeep(state.workflows.find(({ id }) => id === workflowId)) ?? null
  state.editedWorkflow = workflow
}
