import { CustomerSubscriptionPayload, RenewalInterval } from '@/store/modules/billing/types'

type Params = Partial<CustomerSubscriptionPayload>

export const buildCustomerSubscriptionPayload = (
  params: Params = {}
): CustomerSubscriptionPayload => ({
  annotation_credits_bonus: 0,
  annotation_credits_standard_max_in_period_at: 0,
  annotation_credits_standard_max_in_period: 0,
  annotation_credits_standard: 0,
  annotation_credits_used: 0,
  locked_out_reasons: [],
  locked_out: false,
  seconds_per_automation_action: 36,
  storage_extra: 0,
  storage_standard_max_in_period_at: 0,
  storage_standard_max_in_period: 0,
  storage_standard: 0,
  storage_used: 0,
  external_storage_buckets: 0,
  external_storage_buckets_used: 0,
  renewal_interval: RenewalInterval.Monthly,
  ...params
})
