import { Getter } from 'vuex'

import { TeamState } from '@/store/modules/team/state'
import { RootState } from '@/store/types'
import { InvitationPayload } from '@/store/types/InvitationPayload'

export const currentTeamInvitations: Getter<TeamState, RootState> =
  (state): InvitationPayload[] => {
    const { currentTeam, invitations } = state
    if (!(currentTeam && currentTeam.id)) { return [] }
    return invitations.filter(i => i.team_id === currentTeam.id)
  }
