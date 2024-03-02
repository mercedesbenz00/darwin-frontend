import { BillingMutation } from '@/store/modules/billing/types'
import { CreditUsagePayload, CreditUsagePayloadV2 } from '@/store/types'

export const SET_CREDIT_USAGE: BillingMutation<CreditUsagePayload> =
  (state, payload: CreditUsagePayload) => {
    state.creditUsage = payload
  }

export const SET_CREDIT_USAGE_V2: BillingMutation<CreditUsagePayloadV2> =
  (state, payload: CreditUsagePayloadV2) => {
    state.creditUsageV2 = payload
  }
