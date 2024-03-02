import { copyAttributes } from '@/utils'

import { HIDE_OUT_OF_STORAGE_DIALOG } from './mutations/HIDE_OUT_OF_STORAGE_DIALOG'
import { SET_CREDIT_USAGE, SET_CREDIT_USAGE_V2 } from './mutations/SET_CREDIT_USAGE'
import { SHOW_OUT_OF_STORAGE_DIALOG } from './mutations/SHOW_OUT_OF_STORAGE_DIALOG'
import { BillingState, getInitialState } from './state'
import {
  BillingInfoPayload,
  CardStatus,
  Country,
  InvoicePayload,
  UsageReportPayload
} from './types'

const mutations = {
  SET_CREDIT_USAGE,
  SET_CREDIT_USAGE_V2,
  SHOW_OUT_OF_STORAGE_DIALOG,
  HIDE_OUT_OF_STORAGE_DIALOG,
  SET_BILLING_INFO (state: BillingState, data: BillingInfoPayload) {
    state.billingInfo = data
  },

  SET_COUNTRIES (state: BillingState, countries: Country[]) {
    state.countries = countries
  },

  SET_INVOICES (state: BillingState, data: InvoicePayload[]) {
    state.invoices = data
  },

  SET_USAGE_REPORT (state: BillingState, payload: UsageReportPayload) {
    state.usageReport = payload
  },

  SET_CREDITS (state: BillingState, data: number) {
    state.credits = data
  },

  SET_CARD_STATUS (state: BillingState, status: CardStatus | null) {
    state.cardStatus = status
  },

  SET_SELECTED_SOURCE (state: BillingState, data: Pick<BillingInfoPayload, 'selected_source'>) {
    if (!(data.selected_source && state.billingInfo)) { return }
    state.billingInfo.selected_source = data.selected_source
  },

  RESET_ALL (state: BillingState) {
    copyAttributes(state, getInitialState())
  }
}

export default mutations
