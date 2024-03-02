import { ModelDevice, NeuralModelAction } from '@/store/modules/neuralModel/types'
import { createRunningSession } from '@/utils/wind'
import { RunningSessionPayload, TrainedModelPayload } from '@/utils/wind/types'

type Payload = {
  autoStart: boolean
  autoStop: boolean
  device: ModelDevice
  isPublic: boolean
  minimumInstances: number
  maximumInstances: number
  name: string
  trainedModel: TrainedModelPayload
}

type DeployModel = NeuralModelAction<Payload, RunningSessionPayload>

export const deployModel: DeployModel = async ({ commit, rootState }, payload) => {
  const currentTeam = rootState.team.currentTeam
  if (!currentTeam) { throw new Error('[neuralModel/deployModel]: Current team not set') }

  const {
    autoStart,
    autoStop,
    device,
    maximumInstances,
    minimumInstances,
    name,
    isPublic,
    trainedModel
  } = payload

  const response = await createRunningSession({
    accessLevel: isPublic ? 'public' : 'private',
    autoStart,
    autoStop,
    device,
    expand: ['meta.classes', 'meta.num_instances_available', 'meta.num_instances_starting'],
    max: maximumInstances,
    min: minimumInstances,
    trainedModelId: trainedModel.id,
    name,
    teamId: currentTeam.id
  })

  if ('data' in response) { commit('PUSH_RUNNING_SESSION', response.data) }

  return response
}
