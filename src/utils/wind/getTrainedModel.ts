import { WindAuthAction } from '@/utils/backend'
import { errorMessages } from '@/utils/error'

import { withAuth } from './api'
import { TrainedModelPayload, WindResponse } from './types'

type Params = { modelId: string, teamId: number }

export const getTrainedModel = ({ modelId, teamId }: Params): WindResponse<TrainedModelPayload> =>
  withAuth<TrainedModelPayload>(
    { action: WindAuthAction.ViewModels, teamId },
    client => client.get<TrainedModelPayload>(`trained_models/${modelId}`),
    errorMessages.NEURAL_MODEL_LOAD
  )
