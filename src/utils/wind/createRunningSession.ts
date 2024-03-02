import { ModelDevice } from '@/store/modules/neuralModel/types'
import { WindAuthAction } from '@/utils/backend'
import { errorMessages } from '@/utils/error'

import { withAuth } from './api'
import { RunningSessionExpand, RunningSessionPayload, WindResponse } from './types'

type Params = {
  accessLevel: 'public' | 'private'
  autoStart: boolean,
  autoStop: boolean,
  device: ModelDevice
  expand?: RunningSessionExpand[]
  max: number
  min: number
  name: string
  teamId: number
  trainedModelId: string
}

export const createRunningSession = (payload: Params): WindResponse<RunningSessionPayload> => {
  const {
    accessLevel,
    autoStart,
    autoStop,
    device,
    expand,
    max,
    min,
    trainedModelId,
    name,
    teamId
  } = payload

  const path = `trained_models/${trainedModelId}/running_sessions`

  const body = {
    access_level: accessLevel,
    auto_start: autoStart,
    auto_stop: autoStop,
    device,
    max,
    min,
    name
  }

  const params = {
    ...(expand && { expand })
  }

  return withAuth<RunningSessionPayload>(
    { action: WindAuthAction.DeployModel, teamId },
    client => client.post<RunningSessionPayload>(path, body, { params }),
    errorMessages.NEURAL_MODEL_DEPLOY
  )
}
