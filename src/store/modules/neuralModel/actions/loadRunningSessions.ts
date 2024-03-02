import { NeuralModelAction } from '@/store/modules/neuralModel/types'
import { loadRunningSessions as windRequest } from '@/utils/wind'
import { RunningSessionPayload } from '@/utils/wind/types'

type Action = NeuralModelAction<void, RunningSessionPayload[]>

export const loadRunningSessions: Action = async ({ commit, rootState }) => {
  const currentTeam = rootState.team.currentTeam
  if (!currentTeam) { throw new Error('[neuralModel/loadRunningSessions]: Current team not set') }
  const response = await windRequest({
    expand: [
      'meta.classes',
      'meta.num_instances_available',
      'meta.num_instances_starting'
    ],
    teamId: currentTeam.id
  })

  if ('data' in response) {
    commit('SET_RUNNING_SESSIONS', response.data)
    return response
  }

  return response
}
