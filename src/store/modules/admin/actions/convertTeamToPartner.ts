import { AdminAction } from '@/store/modules/admin/types'
import { StoreActionPayload } from '@/store/types'

import { updateTeam } from './updateTeam'

type Payload = { teamId: number }

export const convertTeamToPartner: AdminAction<Payload> = ({ dispatch }, payload) => {
  const params: StoreActionPayload<typeof updateTeam> = {
    teamId: payload.teamId,
    managed_status: 'partner'
  }

  return dispatch('updateTeam', params)
}
