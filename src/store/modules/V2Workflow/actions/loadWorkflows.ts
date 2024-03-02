import { WorkflowAction } from '@/store/modules/V2Workflow/types'
import { loadV2Workflows } from '@/utils/backend'

type Payload = {
  worker?: boolean
}

export const loadWorkflows: WorkflowAction<Payload, void> =
  async ({ commit, rootState }, payload: Payload = {}) => {
    if (!rootState.team.currentTeam) {
      throw new Error('[v2Workflow/loadWorkflows]: Current team not set')
    }

    const { worker = false } = payload
    const response = await loadV2Workflows({ teamSlug: rootState.team.currentTeam.slug, worker })

    if ('data' in response) {
      commit('SET_WORKFLOWS', response.data)
      return { data: undefined }
    }

    return response
  }
