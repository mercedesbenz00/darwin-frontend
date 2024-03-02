import { NeuralModelAction } from '@/store/modules/neuralModel/types'
import { stopTrainingSession as windStopTrainingSession } from '@/utils/wind'
import { TrainingSessionPayload } from '@/utils/wind/types'

type Payload = {
  trainingSession: TrainingSessionPayload
}

type Action = NeuralModelAction<Payload, TrainingSessionPayload>

export const stopTrainingSession: Action = async ({ commit, rootState }, payload) => {
  const { trainingSession } = payload

  const team = rootState.team.currentTeam
  if (!team) {
    throw new Error(
      '[neuralModel/trainModel]: Training model for dataset which is not part of current team'
    )
  }

  const response = await windStopTrainingSession({
    teamId: team.id,
    trainingSession
  })

  if ('data' in response) {
    commit('DELETE_TRAINING_SESSION', trainingSession)
  }

  return response
}
