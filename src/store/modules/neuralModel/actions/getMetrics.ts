import { NeuralModelAction } from '@/store/modules/neuralModel/types'
import { getMetrics as windRequest } from '@/utils/wind'
import { MetricsPayload, TrainingSessionPayload } from '@/utils/wind/types'

type Action = NeuralModelAction<TrainingSessionPayload, MetricsPayload>

export const getMetrics: Action = async ({ commit, rootState }, trainingSession) => {
  const currentTeam = rootState.team.currentTeam
  if (!currentTeam) { throw new Error('[neuralModel/getMetrics]: Current team not set') }

  const response = await windRequest({
    teamId: currentTeam.id,
    trainingSessionId: trainingSession.id
  })

  if ('data' in response) {
    commit('PUSH_METRICS', response.data)
  }

  return response
}
