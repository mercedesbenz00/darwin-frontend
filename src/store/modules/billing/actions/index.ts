import { ActionTree } from 'vuex'

import { BillingState } from '@/store/modules/billing/state'
import { RootState } from '@/store/types'

import { loadBillingInfo } from './loadBillingInfo'
import { loadCountries } from './loadCountries'
import { loadCreditUsage } from './loadCreditUsage'
import { loadInvoices } from './loadInvoices'
import { resetClientUsageLimit } from './resetClientUsageLimit'
import { setClientUsageLimit } from './setClientUsageLimit'
import setSubscriptionAmount from './setSubscriptionAmount'
import updateBillingInfo from './updateBillingInfo'
import { updateCard } from './updateCard'

const actions: ActionTree<BillingState, RootState> = {
  loadBillingInfo,
  loadCountries,
  loadCreditUsage,
  loadInvoices,
  resetClientUsageLimit,
  setClientUsageLimit,
  setSubscriptionAmount,
  updateBillingInfo,
  updateCard
}

export default actions
