import {
  buildAdminTeamPayload,
  buildBillingInfoPayload,
  buildCustomerPayload,
  buildCustomerSubscriptionPayload
} from 'test/unit/factories'

import {
  adaptAdminTeamPayload,
  annotationCreditsAvailableThisPeriod,
  annotationCreditsBilledNextPeriod,
  annotationCreditsBilledThisPeriod,
  annotationCreditsRemainingThisPeriod,
  storageAvailableThisPeriod,
  storageBilledNextPeriod,
  storageBilledThisPeriod,
  storageRemainingThisPeriod
} from '@/utils/billing'

describe('adaptAdminTeamPayload', () => {
  it('accepts an admin team payload', () => {
    const payload = buildAdminTeamPayload({})
    expect(() => adaptAdminTeamPayload(payload)).not.toThrow()
  })
})

const periodStart = 1000
const periodEnd = 1000

const normalInfo = buildBillingInfoPayload({
  customer: buildCustomerPayload({
    stripe_subscription_period_start: periodStart,
    stripe_subscription_period_end: periodEnd
  }),
  customer_subscription: buildCustomerSubscriptionPayload({
    annotation_credits_bonus: 20,
    annotation_credits_standard_max_in_period_at: periodStart,
    annotation_credits_standard_max_in_period: 100,
    annotation_credits_standard: 100,
    annotation_credits_used: 23,
    storage_standard_max_in_period_at: periodStart,
    storage_standard_max_in_period: 1000,
    storage_standard: 1000,
    storage_used: 103
  })
})

// max in period is larger than standard in every category, simulating a
// reduction of subscribed amount within the current billing period

const reducedThisPeriodInfo = buildBillingInfoPayload({
  customer: buildCustomerPayload({
    stripe_subscription_period_start: periodStart,
    stripe_subscription_period_end: periodEnd
  }),
  customer_subscription: buildCustomerSubscriptionPayload({
    annotation_credits_bonus: 20,
    annotation_credits_standard_max_in_period_at: periodStart,
    annotation_credits_standard_max_in_period: 150,
    annotation_credits_standard: 100,
    annotation_credits_used: 23,
    storage_standard_max_in_period_at: periodStart,
    storage_standard_max_in_period: 1100,
    storage_standard: 1000,
    storage_used: 103
  })
})

describe('annotationCreditsBilledThisPeriod', () => {
  it('return recorded max in period amount', () => {
    expect(annotationCreditsBilledThisPeriod(normalInfo)).toEqual(100)
    expect(annotationCreditsBilledThisPeriod(reducedThisPeriodInfo)).toEqual(150)
  })
})

describe('annotationCreditsBilledNextPeriod', () => {
  it('returns standard (currently subscribed) amount', () => {
    expect(annotationCreditsBilledNextPeriod(normalInfo)).toEqual(100)
    expect(annotationCreditsBilledNextPeriod(reducedThisPeriodInfo)).toEqual(100)
  })
})

describe('annotationCreditsAvailableThisPeriod', () => {
  it('returns sum of billed this period and bonus', () => {
    expect(annotationCreditsAvailableThisPeriod(normalInfo)).toEqual(120)
    expect(annotationCreditsAvailableThisPeriod(reducedThisPeriodInfo)).toEqual(170)
  })
})

describe('annotationCreditsRemainingThisPeriod', () => {
  it('returns the difference between billed this period and used amount', () => {
    expect(annotationCreditsRemainingThisPeriod(normalInfo)).toEqual(97)
    expect(annotationCreditsRemainingThisPeriod(reducedThisPeriodInfo)).toEqual(147)
  })
})

describe('storageBilledThisPeriod', () => {
  it('return recorded max in period amount', () => {
    expect(storageBilledThisPeriod(normalInfo)).toEqual(1000)
    expect(storageBilledThisPeriod(reducedThisPeriodInfo)).toEqual(1100)
  })
})

describe('storageBilledNextPeriod', () => {
  it('return recorded standard (currently subscribed) amount', () => {
    expect(storageBilledNextPeriod(normalInfo)).toEqual(1000)
    expect(storageBilledNextPeriod(reducedThisPeriodInfo)).toEqual(1000)
  })
})

describe('storageAvailableThisPeriod', () => {
  it('return billed this period amount amount', () => {
    expect(storageAvailableThisPeriod(normalInfo)).toEqual(1000)
    expect(storageAvailableThisPeriod(reducedThisPeriodInfo)).toEqual(1100)
  })
})

describe('storageRemainingThisPeriod', () => {
  it('return difference between billed this period and used amount', () => {
    expect(storageRemainingThisPeriod(normalInfo)).toEqual(897)
    expect(storageRemainingThisPeriod(reducedThisPeriodInfo)).toEqual(997)
  })
})
