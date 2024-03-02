import {
  CustomerSubscriptionPayload,
  StripeSubscriptionStatus
} from '@/store/modules/billing/types'
import { RootState, TypedAction, TypedMutation } from '@/store/types'

import { AdminState } from './state'

export type AdminAction<T, R = any> = TypedAction<AdminState, RootState, T, R>
export type AdminMutation<P = any> = TypedMutation<AdminState, P>

export type TeamPayload = {
  /* eslint-disable camelcase */
  creation_date: string
  credit_furthest_expiry: string | null
  credit_next_expiry: string | null
  credit_running_out_at: string | null
  customer_v3: { customer_subscription: CustomerSubscriptionPayload },
  dataset_count: number
  disabled_at: string | null
  disabled: boolean
  features: string[]
  id: number
  last_invoice_amount: number
  last_invoice_created: number | null
  last_invoice_due_date: number | null
  last_invoice_pdf: string | null
  last_invoice_status: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void' | null
  managed_status: 'partner' | 'regular' | 'client'
  name: string
  neural_models_enabled: boolean
  note: string | null
  owner_email: string
  owner_first_name: string
  owner_last_name: string
  slug: string
  stripe_id: string
  subscription_id: string
  subscription_period_end: number | null
  subscription_period_start: number | null
  subscription_status: StripeSubscriptionStatus | null
  user_count: number
  /* eslint-enable camelcase */
}

export type TeamOwnerInvitation = {
  id: number
  email: string
  creditAmount: number
  creditExpirationInDays: number
  team: { id: number, name: string } | null
}

export type TeamOwnerInvitationPayload = {
  /* eslint-disable camelcase */
  id: number
  email: string
  credit_amount: number
  credit_expiration_in_days: number
  team: { id: number, name: string } | null
  /* eslint-enable camelcase */
}

export type UpdateTeamParams = {
  /* eslint-disable camelcase */
  id: number
  name?: string
  note?: string
  slug?: string
  disabled?: boolean
  neural_models_enabled?: boolean
  /* eslint-enable camelcase */
}
