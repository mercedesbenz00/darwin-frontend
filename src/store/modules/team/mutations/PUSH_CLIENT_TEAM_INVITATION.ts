import { TeamMutation } from '@/store/modules/team/types'
import { ClientTeamInvitationPayload } from '@/store/types/ClientTeamInvitationPayload'

export const PUSH_CLIENT_TEAM_INVITATION: TeamMutation<ClientTeamInvitationPayload> = (
  state,
  payload
) => {
  const idx = state.clientTeamInvitations.findIndex(i => i.id === payload.id)
  if (idx > -1) {
    state.clientTeamInvitations.splice(idx, 1, payload)
  } else {
    state.clientTeamInvitations.push(payload)
  }
}
