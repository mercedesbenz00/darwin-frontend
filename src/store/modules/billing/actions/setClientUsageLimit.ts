import {
  BillingAction,
  CustomerSubscriptionPayload,
  ProductType
} from '@/store/modules/billing/types'
import { TeamPayload } from '@/store/types'
import { updateTeamUsageLimit } from '@/utils/backend'

class ActionError extends Error {
  constructor (message: string) {
    super(`billing/setClientUsageLimit: ${message}`)
  }
}

type Payload = {
  client: TeamPayload
  type: ProductType.AnnotationCredits | ProductType.Storage,
  value: number
}
type SetClientUsageLimit = BillingAction<Payload, CustomerSubscriptionPayload>

const resolveParams =
  (payload: Payload): Omit<Parameters<typeof updateTeamUsageLimit>[0], 'teamSlug'> => {
    if (payload.type === ProductType.AnnotationCredits) {
      return { credits: payload.value }
    }

    if (payload.type === ProductType.Storage) {
      return { storage: payload.value }
    }

    throw new ActionError(`Invalid payload: ${JSON.stringify(payload)}`)
  }

/**
 * Set subscription amount on customer, for a specific product type.
 */
export const setClientUsageLimit: SetClientUsageLimit = async ({ dispatch }, payload) => {
  const params = {
    ...resolveParams(payload),
    teamSlug: payload.client.slug
  }

  const response = await updateTeamUsageLimit(params)

  if ('data' in response) {
    dispatch('loadBillingInfo')
    dispatch('loadCreditUsage')
  }

  return response
}
