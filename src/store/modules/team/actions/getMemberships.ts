import { TeamAction } from '@/store/modules/team/types'
import { MembershipPayload } from '@/store/types/MembershipPayload'
import { TeamPayload } from '@/store/types/TeamPayload'
import { loadTeamMemberships } from '@/utils/backend'

type Action = TeamAction<TeamPayload, MembershipPayload[]>

/**
 * Get the list of team members for current team
 */
export const getMemberships: Action = async ({ commit, state }) => {
  if (!state.currentTeam) { throw new Error('team/getMemberships requires currentTeam to be set') }

  const response = await loadTeamMemberships({ teamSlug: state.currentTeam.slug })

  if ('data' in response) {
    commit('PUSH_MEMBERSHIPS', response.data)
  }

  return response
}
