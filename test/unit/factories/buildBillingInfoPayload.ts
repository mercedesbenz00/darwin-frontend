import { BillingInfoPayload } from '@/store/modules/billing/types'

import { buildCustomerPayload } from './buildCustomerPayload'
import { buildCustomerSubscriptionPayload } from './buildCustomerSubscriptionPayload'

type BillingInfoPayloadBuildParams = Partial<BillingInfoPayload>

export const buildBillingInfoPayload = (params: BillingInfoPayloadBuildParams): BillingInfoPayload => ({
  address: null,
  balance: 0,
  customer: buildCustomerPayload(),
  name: 'Foo',
  email: 'foo@example.com',
  selected_source: null,
  clients: [],
  freemium: false,
  customer_subscription: buildCustomerSubscriptionPayload({}),
  prices: {
    annotation_credits: {
      standard: {
        billing_scheme: 'tiered',
        id: 'price_an_std',
        recurring: {
          interval: 'month',
          interval_count: 1,
          trial_period_days: 14,
          usage_type: 'licensed'
        },
        tiers: [
          { unit_amount: 150, up_to: 499 },
          { unit_amount: 140, up_to: 999 },
          { unit_amount: 130, up_to: 1999 },
          { unit_amount: 120, up_to: 4999 },
          { unit_amount: 100, up_to: 9999 },
          { unit_amount: 80, up_to: 19999 },
          { unit_amount: 60, up_to: null }
        ],
        tiers_mode: 'graduated',
        type: 'recurring',
        unit_amount: null
      },
      bonus: {
        billing_scheme: 'per_unit',
        id: 'price_an_bon',
        recurring: {
          interval: 'month',
          interval_count: 1,
          trial_period_days: 14,
          usage_type: 'licensed'
        },
        tiers: null,
        tiers_mode: null,
        type: 'recurring',
        unit_amount: 0
      }
    },
    storage: {
      standard: {
        billing_scheme: 'tiered',
        id: 'price_st_std',
        recurring: {
          interval: 'month',
          interval_count: 1,
          trial_period_days: 14,
          usage_type: 'licensed'
        },
        tiers: [
          { unit_amount: 0, up_to: 1000 },
          { unit_amount: 10, up_to: null }
        ],
        tiers_mode: 'graduated',
        type: 'recurring',
        unit_amount: null
      }
    }

  },
  tax_id: null,
  ...params
})
