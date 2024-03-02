import { NeuralModelAction } from '@/store/modules/neuralModel/types'
import { loadInferenceRequests as windRequest } from '@/utils/wind'
import { InferenceRequestCountPayload, RunningSessionPayload } from '@/utils/wind/types'

type RequestParams = Parameters<typeof windRequest>[0]
type Payload = Pick<RequestParams, 'from' | 'granularity'> & {
  runningSession: RunningSessionPayload
}

type LoadInferenceRequests = NeuralModelAction<Payload, InferenceRequestCountPayload[]>

export const loadInferenceRequests: LoadInferenceRequests = async (
  { commit, rootState },
  payload
) => {
  const { from, granularity, runningSession } = payload

  const currentTeam = rootState.team.currentTeam
  if (!currentTeam) { throw new Error('[neuralModel/loadInferenceRequests]: Current team not set') }
  const response = await windRequest({
    from,
    granularity,
    runningSessionId: runningSession.id,
    teamId: currentTeam.id
  })

  if ('data' in response) {
    commit('SET_RUNNING_SESSION_REQUEST_COUNTS', { runningSession, data: response.data })
  }

  return response
}
