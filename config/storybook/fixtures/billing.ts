import {
  BillingInfoPayload,
  CustomerPayload,
  CustomerSubscriptionPayload,
  RenewalInterval,
  StripeSubscriptionStatus
} from '@/store/modules/billing/types'
import { CreditUsagePayload } from '@/store/types'

import { birdsClient, carsClient, partnerTeam } from './teams'

export const subscription: CustomerSubscriptionPayload = {
  annotation_credits_bonus: 0,
  annotation_credits_standard: 0,
  annotation_credits_standard_max_in_period: 0,
  annotation_credits_standard_max_in_period_at: 0,
  annotation_credits_used: 0,
  storage_extra: 0,
  storage_standard: 50000,
  storage_standard_max_in_period: 50000,
  storage_standard_max_in_period_at: 50000,
  storage_used: 14972,
  locked_out_reasons: [],
  locked_out: false,
  seconds_per_automation_action: 36,
  external_storage_buckets: 0,
  external_storage_buckets_used: 0,
  renewal_interval: RenewalInterval.Monthly
}

export const customer: CustomerPayload = {
  id: 1,
  stripe_customer_id: 'str_cus',
  stripe_subscription_period_end: Date.now() + 20 * 24 * 3600,
  stripe_subscription_period_start: Date.now() - 10 * 24 * 3600,
  stripe_subscription_status: StripeSubscriptionStatus.Active,
  stripe_subscription_id: 'str_sub',
  team_id: 1
}

export const annotationCreditsPrice: BillingInfoPayload['prices']['annotation_credits'] = {
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
}

export const storagePrice: BillingInfoPayload['prices']['storage'] = {
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

export const billingInfo: BillingInfoPayload = {
  address: null,
  name: '',
  email: '',
  tax_id: '',
  balance: 0,
  customer,
  freemium: false,
  customer_subscription: subscription,
  selected_source: null,
  clients: [],
  prices: {
    annotation_credits: annotationCreditsPrice,
    storage: storagePrice
  }
}

export const birdsInfo = {
  ...billingInfo,
  customer: { ...billingInfo.customer, team_id: birdsClient.id },
  customer_subscription: { ...billingInfo.customer_subscription, storage_used: 5000 }
}

export const carsInfo = {
  ...billingInfo,
  customer: { ...billingInfo.customer, team_id: carsClient.id },
  customer_subscription: { ...billingInfo.customer_subscription, storage_used: 7000 }
}

export const partnerInfo: BillingInfoPayload = {
  ...billingInfo,
  customer_subscription: {
    ...billingInfo.customer_subscription,
    storage_used: 10000,
    storage_standard_max_in_period: 50000
  },
  clients: [birdsInfo, carsInfo]
}

export const creditUsage: CreditUsagePayload = {
  clients: [],
  period_end: '2020-01-30',
  period_start: '2020-01-01',
  remaining_hours: 500,
  team_id: 1,
  total_available_hours: 1000,
  total_client_used_hours: 0,
  total_used_hours: 500,
  used_automation_hours: 300,
  used_human_hours: 200,
  used_model_hours: 0
}

const birdsUsage: CreditUsagePayload = {
  ...creditUsage,
  team_id: birdsClient.id,
  total_used_hours: 150,
  used_automation_hours: 80,
  used_human_hours: 70,
  used_model_hours: 0
}

const carsUsage: CreditUsagePayload = {
  ...creditUsage,
  team_id: carsClient.id,
  total_used_hours: 50,
  used_automation_hours: 20,
  used_human_hours: 30,
  used_model_hours: 0
}

export const partnerCreditUsage: CreditUsagePayload = {
  clients: [birdsUsage, carsUsage],
  period_end: '2020-01-30',
  period_start: '2020-01-01',
  remaining_hours: 500,
  team_id: partnerTeam.id,
  total_available_hours: 1000,
  total_client_used_hours: 200,
  total_used_hours: 500,
  used_automation_hours: 300,
  used_human_hours: 200,
  used_model_hours: 0
}
