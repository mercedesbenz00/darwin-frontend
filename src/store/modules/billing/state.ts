import { CreditUsagePayload, CreditUsagePayloadV2 } from '@/store/types/CreditUsagePayload'

import {
  BillingInfoPayload,
  CardStatus,
  Country,
  InvoicePayload,
  UsageReportPayload
} from './types'

export interface BillingState {
  billingInfo: BillingInfoPayload | null
  cardStatus: CardStatus | null
  countries: Array<Country>
  credits: number
  creditUsage: CreditUsagePayload | null
  creditUsageV2: CreditUsagePayloadV2 | null
  invoices: InvoicePayload[]
  /**
   * Indicate if out of storage nag dialog is being shown.
   *
   * Use the following mutations to toggle:
   * - billing/SHOW_OUT_OF_STORAGE_DIALOG
   * - billing/HIDE_OUT_OF_STORAGE_DIALOG
   */
  outOfStorageDialogShown: boolean
  subscriptionLoading: boolean
  usageReport: UsageReportPayload | null
}

export const getInitialState = (): BillingState => ({
  billingInfo: null,
  cardStatus: null,
  countries: [],
  credits: 0,
  creditUsage: null,
  creditUsageV2: null,
  invoices: [],
  outOfStorageDialogShown: false,
  subscriptionLoading: false,
  usageReport: null
})
