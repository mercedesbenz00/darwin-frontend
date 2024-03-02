/* eslint-disable camelcase */

import { RootState, TypedAction, TypedMutation } from '@/store/types'

import { BillingState } from './state'

export type BillingAction<T, R = any> = TypedAction<BillingState, RootState, T, R>
export type BillingMutation<R = any> = TypedMutation<BillingState, R>

export enum StripeSubscriptionStatus {
  Active = 'active',
  Cancelled = 'cancelled',
  IncompleteExpired = 'incomplete_expired',
  PastDue = 'past_due',
  Trialing = 'trialing',
  Unpaid = 'unpaid'
}

export enum ProductType {
  AnnotationCredits = 'annotation_credits',
  Storage = 'storage',
  Training = 'training'
}

export type CustomerPayload = {
  id: number
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  stripe_subscription_period_end: number | null
  stripe_subscription_period_start: number | null
  stripe_subscription_status: StripeSubscriptionStatus | null
  team_id: number
}

/**
 * Declaration for a Stripe price object.
 *
 * Used to compute rendered costs in the UI.
 *
 * See https://stripe.com/docs/api/prices to understand how costs
 * ought to be computed.
 */
export type PricePayload = {
  billing_scheme: 'tiered' | 'per_unit'
  id: string
  recurring: {
    interval: 'month'
    interval_count: number
    trial_period_days: number
    usage_type: 'licensed'
  }
  tiers: {
    unit_amount: number
    up_to: number | null
  }[] | null
  tiers_mode: 'graduated' | null
  type: 'recurring'
  unit_amount: number | null
}

export enum LockedOutReason {
  Admin = 'admin',
  AnnotationCredit = 'annotation_credit',
  InstanceCredit = 'instance_credit',
  Storage = 'storage'
}

export enum RenewalInterval {
  Monthly = 'monthly',
  Quarterly = 'quarterly',
  Biyearly = 'biyearly',
  Yearly = 'yearly'
}

export type CustomerSubscriptionPayload = {
  annotation_credits_bonus: number
  annotation_credits_standard: number
  annotation_credits_standard_max_in_period: number
  annotation_credits_standard_max_in_period_at: number
  annotation_credits_used: number
  locked_out_reasons: LockedOutReason[]
  locked_out: boolean
  seconds_per_automation_action: number
  storage_extra: number
  storage_standard: number
  storage_standard_max_in_period: number
  storage_standard_max_in_period_at: number
  storage_used: number

  external_storage_buckets: number // newly added - limit allowed buckets for the team
  external_storage_buckets_used: number // newly added - number of used ext storage buckets
  renewal_interval: RenewalInterval // newly added - subscription renewal interval
}

export type BillingInfoPayload = {
  address: {
    city: string | null
    country: string | null
    line_1: string | null
    line_2: string | null
    postal_code: string | null
    state: string | null
  } | null,
  name: string | null
  email: string | null
  tax_id: string | null
  balance: number
  clients: BillingInfoPayload[]
  customer: CustomerPayload
  freemium: boolean
  selected_source: {
    id: string
    brand: string
    category: 'source'
    last4?: string
    type: 'credit-card'
  } | null
  customer_subscription: CustomerSubscriptionPayload
  prices: {
    [ProductType.AnnotationCredits]: {
      bonus: PricePayload | null
      standard: PricePayload | null
    }
    [ProductType.Storage]: {
      standard: PricePayload | null
    }
  }
}

/**
 * Represents a single generated invoice on the backend.
 */
export type InvoicePayload = {
  id: string
  amount_due: number
  created: number
  currency: string
  due_date: number | null
  invoice_pdf: string
  receipt_url: string | null,
  period_start: number | null
  period_end: number | null
  status: string
  subtotal: number
}

/**
 * Represents overal usage by a team/customer, computed on the backend.
 */
export type UsageReportPayload = {
  /* eslint-disable camelcase */
  annotations: number
  application_calls: number
  images: number
  images_used_in_training: number
  models: number
  applications: number
  /* eslint-enable camelcase */
}

export type Country = {
  alpha2: string
  name: string
}

export type BankAccountParams = { iban: string }

export type CardStatus = {
  complete: boolean
  error: string | null
}

export type CustomerValidationErrors = {
  city?: string
  country?: string
  email?: string
  line1?: string
  line2?: string
  name?: string
  postalCode?: string
  state?: string
  taxId?: string
}
