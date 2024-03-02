import { NeuralModelAction } from '@/store/modules/neuralModel/types'
import { loadRunningSessionInstanceCounts as windRequest } from '@/utils/wind'
import { RunningSessionInstanceCountPayload, RunningSessionPayload } from '@/utils/wind/types'

type RequestParams = Parameters<typeof windRequest>[0]
type Payload = Pick<RequestParams, 'from' | 'granularity'> & {
  runningSession: RunningSessionPayload,
}

type Action = NeuralModelAction<Payload, RunningSessionInstanceCountPayload[]>

export const loadRunningSessionInstanceCounts: Action = async ({ commit, rootState }, payload) => {
  const { from, granularity, runningSession } = payload

  const currentTeam = rootState.team.currentTeam
  if (!currentTeam) {
    throw new Error('[neuralModel/loadRunningSessionInstanceCounts]: Current team not set')
  }

  const response = await windRequest({
    from,
    granularity,
    runningSessionId: runningSession.id,
    teamId: currentTeam.id
  })

  if ('data' in response) {
    commit('SET_RUNNING_SESSION_INSTANCE_COUNTS', { runningSession, data: response.data })
  }

  return response
}
