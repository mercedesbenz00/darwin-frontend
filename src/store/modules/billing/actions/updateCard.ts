import { BillingAction, BillingInfoPayload } from '@/store/modules/billing/types'
import { errorsByCode } from '@/utils'
import { updateCard as request } from '@/utils/backend'
import { stripe } from '@/utils/stripe'

class ActionError extends Error {
  constructor (message: string) {
    super(`billing/updateCard: ${message}`)
  }
}

type Params = { card: string }
type UpdateCard = BillingAction<Params, Pick<BillingInfoPayload, 'selected_source'>>

/**
 * Uses provided card parameters to create a token for a credit card on Stripe,
 * then attaches that token to the customer on the backend.
 */
export const updateCard: UpdateCard = async ({ commit, rootState }, params) => {
  const stripeService = stripe()
  if (!stripeService) {
    throw new ActionError('Stripe service is not available')
  }

  const { currentTeam } = rootState.team
  if (!currentTeam) {
    throw new ActionError('Cannot load usage report while team is not set')
  }

  let stripeResponse

  try {
    stripeResponse = await stripeService.createToken(params.card)
  } catch {
    throw new ActionError(errorsByCode.BILLING_INFO_CARD_CREATE)
  }

  const backendParams = {
    teamId: currentTeam.id,
    token: stripeResponse.token.id
  }
  const response = await request(backendParams)
  if ('data' in response) { commit('SET_SELECTED_SOURCE', response.data) }
  return response
}
