import { NeuralModelAction } from '@/store/modules/neuralModel/types'
import { updateRunningSession as windRequest } from '@/utils/wind'
import { RunningSessionPayload } from '@/utils/wind/types'

type Payload = {
  autoStart?: boolean,
  autoStop?: boolean,
  maximumInstances: number
  minimumInstances: number
  runningSession: RunningSessionPayload,
}
type UpdateModel = NeuralModelAction<Payload, RunningSessionPayload>

export const updateModel: UpdateModel = async ({ commit, rootState }, payload) => {
  const { autoStart, autoStop, maximumInstances, minimumInstances, runningSession } = payload
  const currentTeam = rootState.team.currentTeam
  if (!currentTeam) { throw new Error('[neuralModel/updateModel]: Current team not set') }

  const response = await windRequest({
    autoStart,
    autoStop,
    expand: ['meta.classes', 'meta.num_instances_available', 'meta.num_instances_starting'],
    max: maximumInstances,
    min: minimumInstances,
    runningSessionId: runningSession.id,
    teamId: currentTeam.id
  })

  if ('data' in response) { commit('PUSH_RUNNING_SESSION', response.data) }

  return response
}
