import { InferenceResult, ParsedInferenceData } from '@/engineCommon/backend'
import { WindAuthAction } from '@/utils/backend'
import { errorMessages } from '@/utils/error'

import { withAuth } from './api'
import { RunInferenceResponse, WindResponse } from './types'

type Params = ParsedInferenceData & {
  runningSessionId: string
  teamId: number
}

export const runInference = <T=InferenceResult>(
  params: Params
): WindResponse<RunInferenceResponse<T>> => {
  const { runningSessionId, teamId, ...data } = params
  const authParams = { action: WindAuthAction.RunInference, teamId }
  const path = `running_sessions/${runningSessionId}/infer`

  return withAuth<RunInferenceResponse<T>>(
    authParams,
    client => client.post<RunInferenceResponse<T>>(path, data),
    errorMessages.NEURAL_MODEL_INFER
  )
}
