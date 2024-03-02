import { NeuralModelAction } from '@/store/modules/neuralModel/types'
import { updateRunningSession } from '@/utils/wind'
import { RunningSessionPayload } from '@/utils/wind/types'

type Payload = {
  runningSession: RunningSessionPayload
}

type Action = NeuralModelAction<Payload, RunningSessionPayload>

export const undeployModel: Action = async ({ commit, rootState }, payload) => {
  const currentTeam = rootState.team.currentTeam
  if (!currentTeam) { throw new Error('[neuralModel/undeployModel]: Current team not set') }

  const { runningSession } = payload

  const response = await updateRunningSession({
    autoStop: false,
    max: 0,
    min: 0,
    runningSessionId: runningSession.id,
    teamId: currentTeam.id
  })

  if ('data' in response) { commit('PUSH_RUNNING_SESSION', response.data) }

  return response
}
