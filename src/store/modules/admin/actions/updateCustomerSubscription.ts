import { AdminAction, TeamPayload } from '@/store/modules/admin/types'
import { updateCustomerSubscription as request } from '@/utils/backend'

type Payload = {
  team: TeamPayload,
  /* eslint-disable camelcase */
  seconds_per_automation_action?: number
  storage_extra?: number
  /* eslint-enable camelcase */
}
/**
 * Update the BILLING_V3 customer_subscription record for a team
 */
export const updateCustomerSubscription: AdminAction<Payload, TeamPayload> =
  async ({ commit }, payload) => {
    const { team, ...rest } = payload
    const params: Parameters<typeof request>[0] = {
      teamId: team.id,
      ...rest
    }

    const response = await request(params)
    if ('data' in response) { commit('PUSH_TEAM', response.data) }
    return response
  }
