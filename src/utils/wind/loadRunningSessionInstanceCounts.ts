import { WindAuthAction } from '@/utils/backend'
import { errorMessages } from '@/utils/error'

import { withAuth } from './api'
import { RunningSessionInstanceCountPayload, WindResponse } from './types'

type Params = {
  from?: string
  granularity: 'day' | 'hour' | 'minute'
  runningSessionId: string
  teamId: number
}

export const loadRunningSessionInstanceCounts = (
  payload: Params
): WindResponse<RunningSessionInstanceCountPayload[]> => {
  const { from, granularity, teamId, runningSessionId } = payload

  const authParams = { action: WindAuthAction.ViewModels, teamId }
  const params = {
    granularity,
    ...(from && { from })
  }

  const path = `running_sessions/${runningSessionId}/instance_counts`

  return withAuth<RunningSessionInstanceCountPayload[]>(
    authParams,
    client => client.get<RunningSessionInstanceCountPayload[]>(path, { params }),
    errorMessages.NEURAL_MODEL_DATA
  )
}
