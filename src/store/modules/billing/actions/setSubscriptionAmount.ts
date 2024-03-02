import { BillingInfoPayload, BillingAction, ProductType } from '@/store/modules/billing/types'
import { updateSubscription, UpdateSubscriptionParams } from '@/utils/backend'

class ActionError extends Error {
  constructor (message: string) {
    super(`billing/setSubcriptionAmount: ${message}`)
  }
}

type Payload = { type: ProductType, value: number }
type SetSubcriptionAmount = BillingAction<Payload, BillingInfoPayload>

const resolveParams = (payload: Payload): Omit<UpdateSubscriptionParams, 'teamId'> => {
  const { value, type } = payload

  if (type === ProductType.AnnotationCredits) {
    return { annotation_credits_standard: value }
  }

  if (type === ProductType.Storage) {
    return { storage_standard: value }
  }

  throw new ActionError('Unsupported product type')
}

/**
 * Set subscription amount on customer, for a specific product type.
 */
const setSubcriptionAmount: SetSubcriptionAmount = async ({ commit, rootState }, payload) => {
  if (!rootState.team.currentTeam) {
    throw new ActionError('Cannot update billing info while team is not set')
  }

  const params: UpdateSubscriptionParams = {
    ...resolveParams(payload),
    teamId: rootState.team.currentTeam.id
  }

  const response = await updateSubscription(params)
  if ('data' in response) { commit('SET_BILLING_INFO', response.data) }
  return response
}

export default setSubcriptionAmount
