import { AdminAction, TeamOwnerInvitationPayload } from '@/store/modules/admin/types'
import { createRegularTeamInvitation } from '@/utils/backend'

type Payload = {
  email: TeamOwnerInvitationPayload['email'],
  creditAmount: number,
  creditExpirationInDays: number
}
type Action = AdminAction<Payload, TeamOwnerInvitationPayload>

/**
 * Creates a team owner invitation
 */
export const createTeamOwnerInvitation: Action = async ({ commit }, payload) => {
  const response = await createRegularTeamInvitation(payload)

  if ('data' in response) {
    commit('PUSH_TEAM_OWNER_INVITATION', response.data)
  }

  return response
}
