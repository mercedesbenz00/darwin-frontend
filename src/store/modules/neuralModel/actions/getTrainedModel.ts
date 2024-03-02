import { NeuralModelAction } from '@/store/modules/neuralModel/types'
import { getTrainedModel as windRequest } from '@/utils/wind'
import { TrainedModelPayload } from '@/utils/wind/types'

type GetTrainedModel = NeuralModelAction<{ modelId: string, teamId: number }, TrainedModelPayload>

export const getTrainedModel: GetTrainedModel = async ({ commit }, payload) => {
  const response = await windRequest(payload)
  if ('data' in response) { commit('PUSH_TRAINED_MODEL', response.data) }
  return response
}
