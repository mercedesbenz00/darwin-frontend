import {
  BillingAction,
  BillingInfoPayload,
  CustomerSubscriptionPayload,
  ProductType
} from '@/store/modules/billing/types'
import { TeamPayload } from '@/store/types'
import { updateTeamUsageLimit } from '@/utils/backend'

class ActionError extends Error {
  constructor (message: string) {
    super(`billing/resetClientUsageLimit: ${message}`)
  }
}

type Payload = {
  client: TeamPayload
  type: ProductType.AnnotationCredits | ProductType.Storage,
}
type ResetClientUsageLimit = BillingAction<Payload, CustomerSubscriptionPayload>

const resolveParams = (
  payload: Payload,
  billingInfo: BillingInfoPayload
): Omit<Parameters<typeof updateTeamUsageLimit>[0], 'teamSlug'> => {
  if (payload.type === ProductType.AnnotationCredits) {
    return { credits: billingInfo.customer_subscription.annotation_credits_standard_max_in_period }
  }

  if (payload.type === ProductType.Storage) {
    return { storage: billingInfo.customer_subscription.storage_standard_max_in_period }
  }

  throw new ActionError(`Invalid payload: ${JSON.stringify(payload)}`)
}

/**
 * Set subscription amount on customer, for a specific product type.
 */
export const resetClientUsageLimit: ResetClientUsageLimit =
  async ({ dispatch, state }, payload) => {
    if (!state.billingInfo) {
      throw new ActionError('Billing info for partner team is not loaded')
    }

    const params = {
      ...resolveParams(payload, state.billingInfo),
      teamSlug: payload.client.slug
    }

    const response = await updateTeamUsageLimit(params)

    if ('data' in response) {
      dispatch('loadBillingInfo')
      dispatch('loadCreditUsage')
    }

    return response
  }
