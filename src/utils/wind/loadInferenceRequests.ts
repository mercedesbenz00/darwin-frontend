import { WindAuthAction } from '@/utils/backend'
import { errorMessages } from '@/utils/error'

import { withAuth } from './api'
import { InferenceRequestCountPayload, WindResponse } from './types'

type Params = {
  from?: string
  granularity: 'day' | 'hour' | 'minute'
  runningSessionId: string
  teamId: number
}
export const loadInferenceRequests = (
  payload: Params
): WindResponse<InferenceRequestCountPayload[]> => {
  const { from, granularity, runningSessionId, teamId } = payload

  const authParams = { action: WindAuthAction.ViewModels, teamId }

  const path = `running_sessions/${runningSessionId}/inference_requests`
  const params = {
    granularity,
    ...(from && { from })
  }
  return withAuth<InferenceRequestCountPayload[]>(
    authParams,
    client => client.get<InferenceRequestCountPayload[]>(path, { params }),
    errorMessages.NEURAL_MODEL_DATA
  )
}
