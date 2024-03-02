import { TeamOwnerInvitationPayload } from '@/store/modules/admin/types'

type TeamOwnerInvitationPayloadBuildParams = Partial<TeamOwnerInvitationPayload>

export const buildTeamOwnerInvitationPayload = (params: TeamOwnerInvitationPayloadBuildParams): TeamOwnerInvitationPayload => ({
  id: -1,
  email: '',
  credit_amount: 3600 * 1000,
  credit_expiration_in_days: 20,
  team: null,
  ...params
})
