import { WorkflowAction } from '@/store/modules/V2Workflow/types'
import { createV2Workflow } from '@/utils/backend/createV2Workflow'
import { updateV2Workflow } from '@/utils/backend/updateV2Workflow'

/**
 * Action validates if the user is saving a new workflow or updating an existing one.
 * */
export const submitWorkflow: WorkflowAction<void> = async (
  { commit, state, rootState }
) => {
  if (!state.editedWorkflow) { return }

  const teamSlug = rootState.team.currentTeam?.slug
  if (!teamSlug) { throw new Error('Cannot save workflow without a team') }

  const response = (state.editedWorkflow.id === 'new-workflow')
    ? await createV2Workflow({ teamSlug, ...state.editedWorkflow })
    : await updateV2Workflow({
      teamSlug,
      ...state.editedWorkflow,
      workflowId: state.editedWorkflow.id
    })

  if ('data' in response) {
    commit('SET_WORKFLOW', response.data)
    commit('SET_EDITED_WORKFLOW', response.data)
  }

  return response
}
