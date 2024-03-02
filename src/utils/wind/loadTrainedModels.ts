import { WindAuthAction } from '@/utils/backend'
import { errorMessages } from '@/utils/error'

import { withAuth, withoutAuth } from './api'
import { TrainedModelPayload, WindResponse } from './types'

type Params = { teamId?: number, type?: string }

export const loadTrainedModels = (payload: Params): WindResponse<TrainedModelPayload[]> => {
  const { teamId, type } = payload
  const params = type ? { type } : {}
  const path = 'trained_models'

  if (!teamId) {
    return withoutAuth<TrainedModelPayload[]>(
      client => client.get<TrainedModelPayload[]>(path, { params }),
      errorMessages.NEURAL_MODEL_DATA
    )
  }

  const authParams = { action: WindAuthAction.ViewModels, teamId }

  return withAuth<TrainedModelPayload[]>(
    authParams,
    client => client.get<TrainedModelPayload[]>(path, { params }),
    errorMessages.NEURAL_MODEL_DATA
  )
}
