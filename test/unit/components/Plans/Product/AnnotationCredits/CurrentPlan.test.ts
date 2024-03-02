import { createLocalVue, shallowMount } from '@vue/test-utils'

import {
  buildBillingInfoPayload,
  buildCustomerPayload,
  buildCustomerSubscriptionPayload
} from 'test/unit/factories'

import CurrentPlan from '@/components/Plans/Product/AnnotationCredits/CurrentPlan.vue'
import { installCommonComponents } from '@/plugins/components'
import { BillingInfoPayload, StripeSubscriptionStatus } from '@/store/modules/billing/types'

let info: ReturnType<typeof buildBillingInfoPayload>

let propsData: { billingInfo: BillingInfoPayload }

// month earlier

const localVue = createLocalVue()
installCommonComponents(localVue)

beforeEach(() => {
  const now = new Date().getTime() / 1000
  info = buildBillingInfoPayload({
    customer: buildCustomerPayload({
      stripe_subscription_period_end: now + 30 * 24 * 3600,
      stripe_subscription_period_start: now
    }),
    customer_subscription: buildCustomerSubscriptionPayload({
      annotation_credits_bonus: 10,
      annotation_credits_standard: 100,
      annotation_credits_standard_max_in_period: 100,
      annotation_credits_standard_max_in_period_at: now,
      annotation_credits_used: 111
    })
  })

  propsData = { billingInfo: info }
})

const itMatchesSnapshot = () => {
  it('matches snaphsot', async () => {
    const wrapper = shallowMount(CurrentPlan, { localVue, propsData })
    await wrapper.vm.$nextTick()
    expect(wrapper).toMatchSnapshot()
  })
}

describe('with zero credit', () => {
  beforeEach(() => {
    info.customer_subscription!.annotation_credits_standard = 0
    info.customer_subscription!.annotation_credits_standard_max_in_period = 0
  })

  itMatchesSnapshot()
})

describe('with freemium credit', () => {
  beforeEach(() => {
    info.customer_subscription!.annotation_credits_standard = 100
  })

  itMatchesSnapshot()
})

describe('with team credit', () => {
  beforeEach(() => {
    info.customer_subscription!.annotation_credits_standard = 300
    info.customer_subscription!.annotation_credits_standard_max_in_period = 300
  })

  itMatchesSnapshot()
})

describe('with business credit', () => {
  beforeEach(() => {
    info.customer_subscription!.annotation_credits_standard = 700
    info.customer_subscription!.annotation_credits_standard_max_in_period = 700
  })

  itMatchesSnapshot()
})

describe('with enterprise credit', () => {
  beforeEach(() => {
    info.customer_subscription!.annotation_credits_standard = 3500
    info.customer_subscription!.annotation_credits_standard_max_in_period = 3500
  })

  itMatchesSnapshot()
})

describe('in trial', () => {
  beforeEach(() => {
    info.customer.stripe_subscription_status = StripeSubscriptionStatus.Trialing
    info.customer_subscription!.annotation_credits_bonus = 20
    info.customer_subscription!.annotation_credits_standard = 0
    info.customer_subscription!.annotation_credits_standard_max_in_period = 0
    info.customer_subscription!.annotation_credits_used = 0
  })

  itMatchesSnapshot()
})
