import { TeamPayload } from '@/store/modules/admin/types'
import { CustomerPayload, CustomerSubscriptionPayload } from '@/store/modules/billing/types'

export const adaptAdminTeamPayload = (team: TeamPayload) => ({
  customer: {
    stripe_subscription_period_start: team.subscription_period_start,
    stripe_subscription_period_end: team.subscription_period_end
  },
  customer_subscription: team.customer_v3.customer_subscription
})

type PartialBillingInfo = {
  customer: Pick<
    CustomerPayload,
    'stripe_subscription_period_end' | 'stripe_subscription_period_start'
  >
  // eslint-disable-next-line camelcase
  customer_subscription: Pick<
    CustomerSubscriptionPayload,
    'annotation_credits_bonus' |
    'annotation_credits_standard_max_in_period_at' |
    'annotation_credits_standard_max_in_period' |
    'annotation_credits_standard' |
    'annotation_credits_used' |
    'storage_standard_max_in_period_at' |
    'storage_standard_max_in_period' |
    'storage_standard' |
    'storage_used'
  > | null
}

/**
 * Returns how many credits the customer was charged for in total this period,
 * which can be different from the amount they will be charged for next period.
 *
 * The highest amount the customer paid for remains available to them in the
 * current period. Reductions only start applying at the start of next period.
 */
export const annotationCreditsBilledThisPeriod = (billingInfo: PartialBillingInfo): number => {
  if (!billingInfo.customer_subscription) { throw new Error('No subscription record for customer') }

  const { stripe_subscription_period_start: periodStart } = billingInfo.customer

  if (!periodStart) { throw new Error('Customer record has no period information') }

  const {
    annotation_credits_standard: standard,
    annotation_credits_standard_max_in_period: maxInPeriod,
    annotation_credits_standard_max_in_period_at: maxInPeriodAt
  } = billingInfo.customer_subscription

  return maxInPeriodAt >= periodStart ? maxInPeriod : standard
}

/**
 * Returns the total amount of billed + bonus annotation credits the
 * customer had available in the current billing period.
 */
export const annotationCreditsAvailableThisPeriod = (billingInfo: PartialBillingInfo): number => {
  if (!billingInfo.customer_subscription) { throw new Error('No subscription record for customer') }
  const {
    annotation_credits_bonus: bonus
  } = billingInfo.customer_subscription
  return annotationCreditsBilledThisPeriod(billingInfo) + bonus
}

/**
 * Returns the remaining amount of billed + bonus annotation credits
 * the customer has available in the current billing period.
 */
export const annotationCreditsRemainingThisPeriod = (billingInfo: PartialBillingInfo): number => {
  if (!billingInfo.customer_subscription) { throw new Error('No subscription record for customer') }
  const { annotation_credits_used: used } = billingInfo.customer_subscription
  return Math.max(annotationCreditsAvailableThisPeriod(billingInfo) - used, 0)
}

/**
 * Returns how many credits the customer will be charged for when the next
 * period starts. This can be less than the amount they were charged for in the
 * current period, since they might have reduced their subscription.
 */
export const annotationCreditsBilledNextPeriod = (billingInfo: PartialBillingInfo) => {
  if (!billingInfo.customer_subscription) { throw new Error('No subscription record for customer') }
  const { annotation_credits_standard: standard } = billingInfo.customer_subscription
  return standard
}

/**
 * Returns how much storage the customer was charged for in total this period,
 * which can be different from the amount they will be charged for next period.
 *
 * The highest amount the customer paid for remains available to them in the
 * current period. Reductions only start applying at the start of next period.
 */
export const storageBilledThisPeriod = (billingInfo: PartialBillingInfo): number => {
  if (!billingInfo.customer_subscription) { throw new Error('No subscription record for customer') }

  const { stripe_subscription_period_start: periodStart } = billingInfo.customer

  if (!periodStart) { throw new Error('Customer record has no period information') }

  const {
    storage_standard: standard,
    storage_standard_max_in_period: maxInPeriod,
    storage_standard_max_in_period_at: maxInPeriodAt
  } = billingInfo.customer_subscription

  return maxInPeriodAt >= periodStart ? maxInPeriod : standard
}

/**
 * Returns the total amount of storage the customer had available in the current
 * billing period.
 */
export const storageAvailableThisPeriod = (billingInfo: PartialBillingInfo): number => {
  if (!billingInfo.customer_subscription) { throw new Error('No subscription record for customer') }
  return storageBilledThisPeriod(billingInfo)
}

/**
 * Returns the remaining amount of billed + bonus annotation credits
 * the customer has available in the current billing period.
 */
export const storageRemainingThisPeriod = (billingInfo: PartialBillingInfo): number => {
  if (!billingInfo.customer_subscription) { throw new Error('No subscription record for customer') }
  const { storage_used: used } = billingInfo.customer_subscription
  return Math.max(storageAvailableThisPeriod(billingInfo) - used, 0)
}

/**
 * Returns how many credits the customer will be charged for when the next
 * period starts. This can be less than the amount they were charged for in the
 * current period, since they might have reduced their subscription.
 */
export const storageBilledNextPeriod = (billingInfo: PartialBillingInfo) => {
  if (!billingInfo.customer_subscription) { throw new Error('No subscription record for customer') }
  const { storage_standard: standard } = billingInfo.customer_subscription
  return standard
}
