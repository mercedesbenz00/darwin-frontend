import { TeamPayload } from '@/store/modules/admin/types'

import { buildCustomerSubscriptionPayload } from './buildCustomerSubscriptionPayload'

type TeamPayloadBuildParams = Partial<TeamPayload>

export const buildAdminTeamPayload = (params: TeamPayloadBuildParams): TeamPayload => ({
  creation_date: '',
  credit_furthest_expiry: null,
  credit_next_expiry: null,
  credit_running_out_at: null,
  customer_v3: {
    customer_subscription: buildCustomerSubscriptionPayload({})
  },
  dataset_count: 0,
  disabled_at: null,
  disabled: false,
  features: [],
  id: -1,
  last_invoice_amount: 0,
  last_invoice_created: null,
  last_invoice_due_date: null,
  last_invoice_pdf: null,
  last_invoice_status: null,
  managed_status: 'regular',
  name: '',
  neural_models_enabled: false,
  note: null,
  owner_email: '',
  owner_first_name: '',
  owner_last_name: '',
  slug: '',
  stripe_id: 'cus_GSPfeaOHQTc1Gs',
  subscription_id: 'sub_GSPfNpMZSKEvgy',
  subscription_period_end: null,
  subscription_period_start: null,
  subscription_status: null,
  user_count: 0,
  ...params
})
