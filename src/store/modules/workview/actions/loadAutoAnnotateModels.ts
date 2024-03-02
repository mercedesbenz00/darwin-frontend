import { WorkviewAction } from '@/store/modules/workview/types'
import { RunningSessionExpand, RunningSessionPayload } from '@/store/types'
import { loadRunningSessions } from '@/utils/wind'

type LoadAutoAnnotateModels = WorkviewAction<void, RunningSessionPayload[]>

const loadAutoAnnotateModels: LoadAutoAnnotateModels = async (
  { commit, rootGetters, rootState }
) => {
  const currentTeam = rootState.team.currentTeam
  if (!currentTeam) { throw new Error('[workview/loadAutoAnnotateModels]: Current team not set') }

  const isFeatureEnabled = rootGetters['features/isFeatureEnabled'] as (feature: string) => boolean

  const expand: RunningSessionExpand[] = ['meta.classes', 'meta.num_instances_available']

  const params = isFeatureEnabled('MODEL_TOOL')
    ? { expand, includePublic: true, teamId: currentTeam.id }
    : { includePublic: true, teamId: currentTeam.id, type: 'auto_annotate' }

  const response = await loadRunningSessions(params)
  if (!('data' in response)) { return response }

  const data = isFeatureEnabled('MODEL_TOOL')
    ? response.data.filter(runningSession => runningSession.meta.num_instances_available > 0)
    : response.data

  commit('SET_AUTO_ANNOTATE_MODELS', data)

  return response
}

export default loadAutoAnnotateModels
