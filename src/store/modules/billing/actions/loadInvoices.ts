import { BillingAction, InvoicePayload } from '@/store/modules/billing/types'
import { loadInvoices as request } from '@/utils/backend'

class ActionError extends Error {
  constructor (message: string) {
    super(`billing/loadInvoices: ${message}`)
  }
}

type LoadInvoices = BillingAction<void, InvoicePayload[]>

/**
 * Retrieve a list of recent invoices for the current team
 */
export const loadInvoices: LoadInvoices = async ({ commit, rootState }) => {
  const { currentTeam } = rootState.team
  if (!currentTeam) {
    throw new ActionError('Cannot load recent invoices while team is not set')
  }

  const response = await request(currentTeam.id)
  if ('data' in response) { commit('SET_INVOICES', response.data) }
  return response
}
