import { buildCreditUsagePayload, buildCreditUsagePayloadV2 } from 'test/unit/factories'

import { getInitialState as billingState } from '@/store/modules/billing'
import {
  SET_CREDIT_USAGE,
  SET_CREDIT_USAGE_V2
} from '@/store/modules/billing/mutations/SET_CREDIT_USAGE'
import { BillingState } from '@/store/modules/billing/state'

let state: BillingState

beforeEach(() => { state = billingState() })

describe('SET_CREDIT_USAGE', () => {
  it('sets the credit usage', () => {
    const creditUsage = buildCreditUsagePayload()
    SET_CREDIT_USAGE(state, creditUsage)
    expect(state.creditUsage).toEqual(creditUsage)
  })
})

describe('SET_CREDIT_USAGE_V2', () => {
  it('sets the credit usage', () => {
    const creditUsage = buildCreditUsagePayloadV2()
    SET_CREDIT_USAGE_V2(state, creditUsage)
    expect(state.creditUsageV2).toEqual(creditUsage)
  })
})
