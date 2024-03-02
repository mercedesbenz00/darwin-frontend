import { TeamOwnerInvitationPayload } from '@/store/modules/admin/types'

export type ClientTeamInvitationPayload = TeamOwnerInvitationPayload & {
  /* eslint-disable camelcase */
  partner_team_id: number
  meta: {
    neural_networks: boolean
  }
  /* eslint-enable camelcase */
}
