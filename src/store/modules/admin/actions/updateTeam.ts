import { AdminAction } from '@/store/modules/admin/types'
import { updateTeamAsAdmin } from '@/utils/backend'

type Payload = Parameters<typeof updateTeamAsAdmin>[0]

/**
 * Performs an admin update to the team.
 *
 * This is the core action to update a team as admin. Other actions might use
 * this action to change specific fields in a specific way only.
 */
export const updateTeam: AdminAction<Payload> = async ({ commit }, params) => {
  const response = await updateTeamAsAdmin(params)

  if ('data' in response) {
    commit('PUSH_TEAM', response.data)
  }

  return response
}
