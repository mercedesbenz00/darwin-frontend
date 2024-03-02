import { TeamAction } from '@/store/modules/team/types'
import { MembershipPayload } from '@/store/types/MembershipPayload'
import { TeamPayload } from '@/store/types/TeamPayload'
import { loadTeamMemberships } from '@/utils/backend'

type Action = TeamAction<TeamPayload, MembershipPayload[]>

/**
 * Get the list of partner team members for current team
 */
export const getPartnerMemberships: Action = async ({ commit, state }) => {
  if (!state.currentTeam) {
    throw new Error('team/getPartnerMemberships requires currentTeam to be set')
  }
  if (state.currentTeam.managed_status !== 'client') { return { data: [] } }
  if (!state.currentTeam.partner) { return { data: [] } }

  const response = await loadTeamMemberships({ teamSlug: state.currentTeam.partner.slug })

  if ('data' in response) {
    commit('PUSH_MEMBERSHIPS', response.data)
  }

  return response
}
