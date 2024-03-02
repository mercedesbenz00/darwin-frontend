import { NeuralModelAction } from '@/store/modules/neuralModel/types'
import { loadTrainedModels as windRequest } from '@/utils/wind'
import { TrainedModelPayload } from '@/utils/wind/types'

type LoadTrainedModels = NeuralModelAction<void, TrainedModelPayload[]>

export const loadTrainedModels: LoadTrainedModels = async ({ commit, rootState }) => {
  const currentTeam = rootState.team.currentTeam
  if (!currentTeam) { throw new Error('[neuralModel/loadTrainedModels]: Current team not set') }
  const response = await windRequest({ teamId: currentTeam.id })

  if ('data' in response) {
    commit('SET_TRAINED_MODELS', response.data)
    return response
  }

  return response
}
