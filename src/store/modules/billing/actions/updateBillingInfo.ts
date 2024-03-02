import { BillingInfoPayload, BillingAction } from '@/store/modules/billing/types'
import { updateBillingInfo as request } from '@/utils/backend'

class ActionError extends Error {
  constructor (message: string) {
    super(`billing/updateBillingInfo: ${message}`)
  }
}

type ReadOnlyFields =
  'balance' |
  'clients' |
  'customer_subscription' |
  'customer' |
  'prices' |
  'selected_source' |
  'freemium'

  type UpdateBillingInfoPayload = Omit<BillingInfoPayload, ReadOnlyFields>

type UpdateBillingInfo = BillingAction<UpdateBillingInfoPayload, BillingInfoPayload>

/**
 * Update billing address for the current team.
 */
const updateBillingInfo: UpdateBillingInfo = async ({ commit, rootState }, payload) => {
  // Update billing info on backend. If card or bank account was updated,
  // backend will associate new payment source with customer.

  if (!rootState.team.currentTeam) {
    throw new ActionError('Cannot update billing info while team is not set')
  }
  const { address, ...rest } = payload
  const params = {
    teamId: rootState.team.currentTeam.id,
    ...(address && { address }),
    ...rest
  }

  const response = await request(params)
  if ('data' in response) { commit('SET_BILLING_INFO', response.data) }
  return response
}

export default updateBillingInfo
