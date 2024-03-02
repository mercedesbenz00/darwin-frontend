import { CustomerPayload } from '@/store/modules/billing/types'

type CustomerPayloadBuildParams = Partial<CustomerPayload>

export const buildCustomerPayload = (params: CustomerPayloadBuildParams = {}): CustomerPayload => ({
  id: -1,
  stripe_customer_id: null,
  stripe_subscription_id: null,
  stripe_subscription_period_end: null,
  stripe_subscription_period_start: null,
  stripe_subscription_status: null,
  team_id: -1,
  ...params
})
