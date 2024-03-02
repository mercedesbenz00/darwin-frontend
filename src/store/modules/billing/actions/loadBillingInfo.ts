import { BillingAction, BillingInfoPayload } from '@/store/modules/billing/types'
import { loadBillingInfo as request } from '@/utils/backend'

class ActionError extends Error {
  constructor (message: string) {
    super(`billing/loadBillingInfo: ${message}`)
  }
}

type LoadBillingInfo = BillingAction<void, BillingInfoPayload>

/**
 * Retrieve billing information for current team
 */
export const loadBillingInfo: LoadBillingInfo = async ({ commit, rootState }) => {
  const { currentTeam } = rootState.team
  if (!currentTeam) {
    throw new ActionError('Cannot load billing information while team is not set')
  }

  const response = await request(currentTeam.id)
  if ('data' in response) { commit('SET_BILLING_INFO', response.data) }
  return response
}
