import { Getter } from 'vuex'

import { TeamState } from '@/store/modules/team/state'
import { RootState, ClientTeamInvitationPayload } from '@/store/types'

/**
 * If the current team is a partner team, it is able to create invitations for
 * client teams to join the platform.
 *
 * This retrieves any such loaded invitations from the store.
 */
export const currentTeamClientInvitations: Getter<TeamState, RootState> =
  (state): ClientTeamInvitationPayload[] => {
    const { currentTeam, clientTeamInvitations } = state
    if (!(currentTeam?.id)) { return [] }
    return clientTeamInvitations.filter(i => i.partner_team_id === currentTeam.id)
  }
