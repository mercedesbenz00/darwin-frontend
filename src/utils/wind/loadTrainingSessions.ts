import { WindAuthAction } from '@/utils/backend'
import { errorMessages } from '@/utils/error'

import { withAuth, withoutAuth } from './api'
import { TrainingSessionPayload, WindResponse } from './types'

type Params = { teamId?: number }

export const loadTrainingSessions = (payload: Params): WindResponse<TrainingSessionPayload[]> => {
  const { teamId } = payload
  const params = {}
  const path = 'training_sessions'

  if (!teamId) {
    return withoutAuth<TrainingSessionPayload[]>(
      client => client.get<TrainingSessionPayload[]>(path, { params }),
      errorMessages.NEURAL_MODEL_DATA
    )
  }

  const authParams = { action: WindAuthAction.ViewModels, teamId }

  return withAuth<TrainingSessionPayload[]>(
    authParams,
    client => client.get<TrainingSessionPayload[]>(path, { params }),
    errorMessages.NEURAL_MODEL_DATA
  )
}
