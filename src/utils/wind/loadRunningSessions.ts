import { WindAuthAction } from '@/utils/backend'
import { errorMessages } from '@/utils/error'

import { withAuth, withoutAuth } from './api'
import { RunningSessionExpand, RunningSessionPayload, WindResponse } from './types'

type Params = {
  expand?: RunningSessionExpand[]
  includePublic?: boolean,
  teamId?: number,
  type?: string
}

export const loadRunningSessions = (payload: Params): WindResponse<RunningSessionPayload[]> => {
  /* eslint-disable camelcase */
  const { expand, includePublic: include_public, teamId, type } = payload

  const params = {
    ...(expand && { expand }),
    ...(include_public && { include_public }),
    ...(type && { type })
  }

  const path = 'running_sessions'

  if (!teamId) {
    return withoutAuth(
      client => client.get(path, { params }),
      errorMessages.NEURAL_MODEL_DATA
    )
  }

  const authParams = { action: WindAuthAction.ViewModels, teamId }
  return withAuth<RunningSessionPayload[]>(
    authParams,
    client => client.get<RunningSessionPayload[]>(path, { params }),
    errorMessages.NEURAL_MODEL_DATA
  )
  /* eslint-enable camelcase */
}
