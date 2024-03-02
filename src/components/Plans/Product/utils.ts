import { PricePayload, BillingInfoPayload } from '@/store/modules/billing/types'

export const resolveProductPrice = (amount: number, data: PricePayload | null): number => {
  if (!data) { return 0 }

  if (data.billing_scheme === 'per_unit' && data.unit_amount !== null) {
    return amount * data.unit_amount
  }

  if (data.billing_scheme === 'tiered' && data.tiers && data.tiers_mode === 'graduated') {
    const initial: [number, number, number | null] = [0, amount, 0]
    const [cost] = (data.tiers || []).reduce(([total, amountLeft, prevTierUpTo], tier) => {
      if (prevTierUpTo === null) {
        throw new Error('Invalid tier data when resolving product price')
      }
      const amountAvailableInThisTier = tier.up_to ? tier.up_to - prevTierUpTo : amountLeft
      const newAmountLeft = Math.max(amountLeft - amountAvailableInThisTier, 0)
      const costInThisTier = (amountLeft - newAmountLeft) * tier.unit_amount
      const newTotal = total + costInThisTier
      return [newTotal, newAmountLeft, tier.up_to]
    }, initial)

    return cost
  }
  throw new Error('Unable to resolve product price')
}

export const resolveUndiscountedProductPrice = (
  amount: number,
  data: PricePayload | null
): number => {
  if (!data) { return 0 }

  if (data.billing_scheme === 'per_unit' && data.unit_amount !== null) {
    return amount * data.unit_amount
  }

  if (data.billing_scheme === 'tiered' && data.tiers && data.tiers_mode === 'graduated') {
    return amount * data.tiers[0].unit_amount
  }

  throw new Error('Unable to resolve product price')
}

const SECONDS_IN_DAY = 3600 * 24
export const resolveTrialDaysLeft = (billingInfo: BillingInfoPayload): number => {
  const { customer } = billingInfo
  const now = Math.floor(Date.now() / 1000)
  const trialEnd = customer.stripe_subscription_period_end || 0
  return Math.max(Math.round((trialEnd - now) / SECONDS_IN_DAY), 0)
}

export type SubscriptionPlanName = 'freemium' | 'essentials' | 'team' | 'business' | 'enterprise'
export const subscriptionPlans: SubscriptionPlanName[] =
  ['freemium', 'team', 'business', 'enterprise']

export type PlanFeature = {
  label: string
  or?: boolean
  enabled?: boolean
  // The Plan name from which this feature is being supported.
  supportedPlans?: SubscriptionPlanName[]
}

export enum PlanPricing {
  essentials = 100,
  freemium = 100,
  team = 300,
  business = 700,
  enterprise = 3500
}

export const resolveDisplayPlanName = (plan: SubscriptionPlanName): string => {
  if (plan === 'freemium') {
    return 'education'
  }
  return plan
}

export const resolvePlanForCredit = (credit: number): SubscriptionPlanName => {
  if (credit <= PlanPricing.freemium) { return 'freemium' }
  if (credit <= PlanPricing.team) { return 'team' }
  if (credit < PlanPricing.enterprise) { return 'business' }
  return 'enterprise'
}

export const PLAN_SPECIFIC_FEATURES: { [key: string]: PlanFeature[] } = {
  essentials: [{ label: '50,000 Files managed' }],
  freemium: [{ label: '50,000 Files managed' }],
  team: [{ label: '250,000 Files managed' }],
  business: [{ label: '3 Million Files managed' }],
  enterprise: [{ label: '5M+ Files managed' }]
}

export const SHARED_FEATURES: PlanFeature[] = [
  {
    label: 'Image and Video annotation',
    supportedPlans: ['freemium', 'team', 'business', 'enterprise']
  },
  { label: 'Unlimited Users', supportedPlans: ['freemium', 'team', 'business', 'enterprise'] },
  {
    label: 'Email Technical Support',
    supportedPlans: ['freemium', 'team', 'business', 'enterprise']
  },
  { label: '60+ Second & 4K Video', supportedPlans: ['team', 'business', 'enterprise'] },
  { label: 'Ultra-High Resolution Images', supportedPlans: ['team', 'business', 'enterprise'] },
  { label: 'DICOM Imaging', supportedPlans: ['team', 'business', 'enterprise'] },
  { label: 'ML Customer Success', supportedPlans: ['business', 'enterprise'] },
  { label: 'Private AWS S3 Integration', supportedPlans: ['business', 'enterprise'] },
  { label: 'Daily Data Backups', supportedPlans: ['business', 'enterprise'] },
  { label: 'Consensus Stages', supportedPlans: ['business', 'enterprise'] },
  { label: 'Dedicated Customer Success', supportedPlans: ['enterprise'] },
  { label: 'Integration Engineering Support', supportedPlans: ['enterprise'] },
  { label: 'SSO', supportedPlans: ['enterprise'] },
  { label: 'Security Reports', supportedPlans: ['enterprise'] },
  { label: 'On-Premise Option', supportedPlans: ['enterprise'] }
]

export const FREEMIUM_FEATURES: PlanFeature[] = [
  {
    label: 'Image and Video annotation',
    supportedPlans: ['freemium', 'team', 'business', 'enterprise']
  },
  { label: 'Up to 3 Users', supportedPlans: ['freemium', 'team', 'business', 'enterprise'] },
  { label: 'Community Support', supportedPlans: ['freemium', 'team', 'business', 'enterprise'] },
  {
    label: 'Access to all labeling tools',
    supportedPlans: ['freemium', 'team', 'business', 'enterprise']
  },
  {
    label: 'Model training and inference',
    supportedPlans: ['freemium', 'team', 'business', 'enterprise']
  },
  { label: '60+ Second & 4K Video', supportedPlans: ['team', 'business', 'enterprise'] },
  { label: 'Ultra-High Resolution Images', supportedPlans: ['team', 'business', 'enterprise'] },
  { label: 'DICOM Imaging', supportedPlans: ['team', 'business', 'enterprise'] },
  { label: 'ML Customer Success', supportedPlans: ['business', 'enterprise'] },
  { label: 'Private AWS S3 Integration', supportedPlans: ['business', 'enterprise'] },
  { label: 'Daily Data Backups', supportedPlans: ['business', 'enterprise'] },
  { label: 'Consensus Stages', supportedPlans: ['business', 'enterprise'] },
  { label: 'Dedicated Customer Success', supportedPlans: ['enterprise'] },
  { label: 'Integration Engineering Support', supportedPlans: ['enterprise'] },
  { label: 'SSO', supportedPlans: ['enterprise'] },
  { label: 'Security Reports', supportedPlans: ['enterprise'] },
  { label: 'On-Premise Option', supportedPlans: ['enterprise'] }
]

export const resolveFeaturesForPlan = (plan: SubscriptionPlanName): PlanFeature[] => {
  const features = [
    ...PLAN_SPECIFIC_FEATURES[plan],
    ...plan === 'freemium' ? FREEMIUM_FEATURES : SHARED_FEATURES
  ]
  return features.map((feature) => {
    if (!feature.supportedPlans) { return { ...feature, enabled: true } }
    if (feature.supportedPlans.includes(plan)) { return { ...feature, enabled: true } }
    return {
      ...feature,
      enabled: false
    }
  })
}
