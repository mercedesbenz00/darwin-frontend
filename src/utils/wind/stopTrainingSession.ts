import { WindAuthAction } from '@/utils/backend'
import { errorMessages } from '@/utils/error'

import { withAuth } from './api'
import { TrainingSessionPayload, WindResponse } from './types'

type Params = {
  teamId: number
  trainingSession: TrainingSessionPayload
 }

export const stopTrainingSession = (params: Params): WindResponse<TrainingSessionPayload> => {
  const { teamId, trainingSession } = params
  const authParams = { action: WindAuthAction.TrainModels, teamId }

  const path = `training_sessions/${trainingSession.id}`

  return withAuth<TrainingSessionPayload>(
    authParams,
    client => client.delete<TrainingSessionPayload>(path),
    errorMessages.NEURAL_MODEL_STOP_TRAINING_SESSION
  )
}
