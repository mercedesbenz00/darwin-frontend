import { BillingAction } from '@/store/modules/billing/types'
import { CreditUsagePayload, FeatureName } from '@/store/types'
import { loadCreditUsage as request } from '@/utils/backend'

class ActionError extends Error {
  constructor (message: string) {
    super(`billing/loadCreditUsage: ${message}`)
  }
}

type LoadCreditUsage = BillingAction<void, CreditUsagePayload>

/**
 * Load credit usage for the current team
 */
export const loadCreditUsage: LoadCreditUsage = async ({ commit, rootState, rootGetters }) => {
  if (!rootState.team.currentTeam) {
    throw new ActionError('Cannot load credit usage while team is not set')
  }

  const feature: FeatureName = 'TICKER_UI'
  const isTicker = rootGetters['features/isFeatureEnabled'](feature)

  const params = {
    teamSlug: rootState.team.currentTeam.slug,
    type: 'annotation_credits'
  }

  if (isTicker) {
    params.type = 'ticks'
  }

  const response = await request(params)
  if ('data' in response) {
    if (isTicker) {
      commit('SET_CREDIT_USAGE_V2', response.data)
    } else {
      commit('SET_CREDIT_USAGE', response.data)
    }
  }
  return response
}
