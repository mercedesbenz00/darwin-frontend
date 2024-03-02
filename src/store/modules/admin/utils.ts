import { TeamOwnerInvitation, TeamOwnerInvitationPayload } from './types'

export const normalizeTeamOwnerInvitation = (
  data: TeamOwnerInvitationPayload
): TeamOwnerInvitation => ({
  id: data.id,
  email: data.email,
  team: data.team
    ? {
      id: data.team.id,
      name: data.team.name
    }
    : null,
  creditAmount: data.credit_amount,
  creditExpirationInDays: data.credit_expiration_in_days
})
