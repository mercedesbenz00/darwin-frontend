import { WindAuthAction } from '@/utils/backend'
import { errorMessages } from '@/utils/error'

import { withAuth } from './api'
import { MetricsPayload, WindResponse } from './types'

type Params = { teamId: number, trainingSessionId: string }

export const getMetrics = ({ teamId, trainingSessionId }: Params): WindResponse<MetricsPayload> =>
  withAuth<MetricsPayload>(
    { action: WindAuthAction.ViewModels, teamId },
    client => client.get<MetricsPayload>(`training_sessions/${trainingSessionId}/metrics`),
    errorMessages.NEURAL_MODEL_LOAD
  )
