import { WindAuthAction } from '@/utils/backend'
import { errorMessages } from '@/utils/error'

import { withAuth } from './api'
import { RunningSessionExpand, RunningSessionPayload, WindResponse } from './types'

type Params = {
  autoStart?: boolean
  autoStop?: boolean
  expand?: RunningSessionExpand[]
  min: number
  max: number
  runningSessionId: string
  teamId: number
}

export const updateRunningSession = (payload: Params): WindResponse<RunningSessionPayload> => {
  const { autoStart, autoStop, expand, max, min, runningSessionId, teamId } = payload

  const authParams = { action: WindAuthAction.DeployModel, teamId }
  const path = `running_sessions/${runningSessionId}`
  const body = { auto_start: autoStart, auto_stop: autoStop, max, min }
  const params = {
    ...(expand && { expand })
  }

  return withAuth<RunningSessionPayload>(
    authParams,
    client => client.put<RunningSessionPayload>(path, body, { params }),
    errorMessages.NEURAL_MODEL_UPDATE
  )
}
