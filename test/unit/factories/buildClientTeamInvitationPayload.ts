import { ClientTeamInvitationPayload } from '@/store/types'

type Params = Partial<ClientTeamInvitationPayload>

export const buildClientTeamInvitationPayload = (params: Params): ClientTeamInvitationPayload => ({
  id: -1,
  email: '',
  credit_amount: 3600 * 1000,
  credit_expiration_in_days: 20,
  meta: { neural_networks: false },
  partner_team_id: -1,
  team: null,
  ...params
})
