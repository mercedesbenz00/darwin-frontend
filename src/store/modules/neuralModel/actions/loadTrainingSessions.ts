import { NeuralModelAction } from '@/store/modules/neuralModel/types'
import { loadTrainingSessions as windRequest } from '@/utils/wind'
import { TrainingSessionPayload } from '@/utils/wind/types'

type Action = NeuralModelAction<void, TrainingSessionPayload[]>

export const loadTrainingSessions: Action = async ({ commit, rootState }) => {
  const currentTeam = rootState.team.currentTeam
  if (!currentTeam) { throw new Error('[neuralModel/loadTrainedModels]: Current team not set') }
  const response = await windRequest({ teamId: currentTeam.id })
  if ('data' in response) { commit('SET_TRAINING_SESSIONS', response.data) }
  return response
}
