import { AdminAction } from '@/store/modules/admin/types'
import { FeaturePayload } from '@/store/types/FeaturePayload'
import { createTeamFeature as request } from '@/utils/backend'

type Action = AdminAction<{ teamId: number, feature: FeaturePayload['name'] }, void>

/**
 * Enable a feature flag on a team
 */
export const createTeamFeature: Action = async ({ commit }, payload) => {
  const { teamId, feature } = payload

  const response = await request({ teamId, feature })
  if (!('error' in response)) {
    commit('PUSH_TEAM_FEATURE', { teamId, feature })
  }
  return response
}
