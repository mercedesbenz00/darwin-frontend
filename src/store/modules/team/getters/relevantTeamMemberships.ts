import { Getter } from 'vuex'

import { TeamState } from '@/store/modules/team/state'
import { RootState } from '@/store/types'
import { MembershipPayload } from '@/store/types/MembershipPayload'

export const getRelevantTeamMemberships = (state: TeamState): MembershipPayload[] => {
  const { currentTeam, memberships } = state

  if (!currentTeam) { return [] }

  // partner and regular teams just filter their own members

  if (currentTeam.managed_status !== 'client') {
    return memberships.filter(m => m.team_id === currentTeam.id)
  }

  // client teams also filter their partner's members
  // if a user is a member in both partner and client, the client membership is used
  const ownMemberships = memberships.filter(m => m.team_id === currentTeam.id)

  const ownUserIds = ownMemberships.map(m => m.user_id)
  const partnerMembershipsNotInOwn =
      memberships.filter(m =>
        m.team_id === currentTeam.partner_id && !ownUserIds.includes(m.user_id)
      )

  return ownMemberships.concat(partnerMembershipsNotInOwn)
}

/**
 * Returns all stored memberships relevant to the currentTeam
 *
 * When the current team is a regular or partner team, it will only return it's members.
 *
 * When the current team is a client team, it will return it's members as well
 * as any available members of the partner team.
 */
export const relevantTeamMemberships: Getter<TeamState, RootState> =
  (state) => getRelevantTeamMemberships(state)
