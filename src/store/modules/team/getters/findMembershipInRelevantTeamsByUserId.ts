import { Getter } from 'vuex'

import { TeamState } from '@/store/modules/team/state'
import { RootState } from '@/store/types'
import { MembershipPayload } from '@/store/types/MembershipPayload'

export const findMembershipInRelevantTeamsByUserId: Getter<TeamState, RootState> = (state) =>
  (userId: number): MembershipPayload | null => {
    const { currentTeam, memberships } = state
    const relevantTeamIds: number[] = []

    if (currentTeam) { relevantTeamIds.push(currentTeam.id) }

    if (currentTeam?.managed_status === 'client' && currentTeam.partner_id) {
      relevantTeamIds.push(currentTeam.partner_id)
    }

    if (currentTeam?.managed_status === 'partner' && currentTeam.clients) {
      relevantTeamIds.concat(currentTeam.clients.map(t => t.id))
    }

    return (
      memberships.find(m => relevantTeamIds.includes(m.team_id) && m.user_id === userId) ||
      null
    )
  }
