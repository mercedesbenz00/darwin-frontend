import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildBillingInfoPayload,
  buildCustomerPayload,
  buildCustomerSubscriptionPayload,
  buildTeamPayload
} from 'test/unit/factories'

import BillingBox from '@/components/Dataset/BillingBox.vue'
import { installCommonComponents } from '@/plugins/components'
import { StripeSubscriptionStatus, LockedOutReason } from '@/store/modules/billing/types'
import { unixNowSeconds } from '@/utils'

let localVue: ReturnType<typeof createLocalVue>
let store: ReturnType<typeof createTestStore>
let billingInfo: ReturnType<typeof buildBillingInfoPayload>
const mocks = { $can: () => true }

const periodStart = unixNowSeconds() - 11 * 24 * 3600
const periodEnd = unixNowSeconds() + 11 * 24 * 3600

beforeEach(() => {
  localVue = createLocalVue()
  localVue.use(Vuex)
  installCommonComponents(localVue)
  store = createTestStore()
  store.commit('team/SET_CURRENT_TEAM', buildTeamPayload({ name: 'V7' }))

  billingInfo = buildBillingInfoPayload({
    customer: buildCustomerPayload({
      stripe_subscription_period_end: periodEnd,
      stripe_subscription_period_start: periodStart
    }),
    customer_subscription: buildCustomerSubscriptionPayload({
      annotation_credits_bonus: 10,
      annotation_credits_standard_max_in_period_at: periodStart + 1,
      annotation_credits_standard_max_in_period: 100,
      annotation_credits_standard: 100,
      annotation_credits_used: 20,
      locked_out_reasons: [],
      locked_out: false,
      storage_standard: 1000,
      storage_used: 900
    })
  })
})

const itMatchesSnapshot = () => it('matches snapshot', () => {
  const wrapper = shallowMount(BillingBox, { localVue, mocks, store })
  expect(wrapper).toMatchSnapshot()
})

const itRendersNothing = () => it('renders nothing', () => {
  const wrapper = shallowMount(BillingBox, { localVue, mocks, store })
  expect(wrapper.html()).toEqual('')
})

describe('with active subscription', () => {
  beforeEach(() => {
    store.commit('billing/SET_BILLING_INFO', billingInfo)
  })

  itMatchesSnapshot()
  itRendersNothing()
})

describe('with current subscription less than max in period', () => {
  beforeEach(() => {
    billingInfo.customer_subscription!.annotation_credits_standard_max_in_period = 150
    store.commit('billing/SET_BILLING_INFO', billingInfo)
  })

  itMatchesSnapshot()
  itRendersNothing()
})

describe('trialing', () => {
  beforeEach(() => {
    billingInfo.customer.stripe_subscription_status = StripeSubscriptionStatus.Trialing
    billingInfo.customer_subscription!.annotation_credits_bonus = 19
    billingInfo.customer_subscription!.annotation_credits_used = 3
    store.commit('billing/SET_BILLING_INFO', billingInfo)
  })

  itMatchesSnapshot()

  it('renders data', () => {
    const wrapper = shallowMount(BillingBox, { localVue, mocks, store })
    expect(wrapper.findAll('.info-item__value').at(0).text()).toEqual('11')
    expect(wrapper.findAll('.info-item__value').at(1).text()).toEqual('16')
    expect(wrapper.findAll('.info-item__value').at(2).text()).toEqual('100 managed files remaining')
  })

  it('renders title', () => {
    const wrapper = shallowMount(BillingBox, { localVue, mocks, store })
    expect(wrapper.text()).toContain("Welcome to V7's Free Trial")
  })
})

describe('out of trial credits', () => {
  beforeEach(() => {
    billingInfo.customer.stripe_subscription_status = StripeSubscriptionStatus.Trialing
    billingInfo.customer_subscription!.annotation_credits_bonus = 20
    billingInfo.customer_subscription!.annotation_credits_used = 20
    billingInfo.customer_subscription!.annotation_credits_standard = 0
    billingInfo.customer_subscription!.annotation_credits_standard_max_in_period = 0
    store.commit('billing/SET_BILLING_INFO', billingInfo)
  })

  itMatchesSnapshot()

  it('renders data', () => {
    const wrapper = shallowMount(BillingBox, { localVue, mocks, store })
    expect(wrapper.findAll('.info-item__value').at(1).text()).toContain('0')
    expect(wrapper.findAll('.info-item__value').at(2).text()).toEqual('100 managed files remaining')
  })

  it('renders title', () => {
    const wrapper = shallowMount(BillingBox, { localVue, mocks, store })
    expect(wrapper.text()).toContain('Your free trial has ended - Upgrade now')
  })
})

describe('locked out', () => {
  beforeEach(() => {
    billingInfo.customer_subscription!.locked_out = true
    billingInfo.customer_subscription!.locked_out_reasons = [
      LockedOutReason.Admin,
      LockedOutReason.AnnotationCredit,
      LockedOutReason.InstanceCredit,
      LockedOutReason.Storage
    ]
    store.commit('billing/SET_BILLING_INFO', billingInfo)
  })

  itMatchesSnapshot()

  it('renders data', () => {
    const wrapper = shallowMount(BillingBox, { localVue, mocks, store })
    expect(wrapper.findAll('.info-item__value').at(0).text()).toContain('90')
    expect(wrapper.findAll('.info-item__value').at(1).text()).toEqual('100 managed files remaining')
  })

  it('renders title', () => {
    const wrapper = shallowMount(BillingBox, { localVue, mocks, store })
    expect(wrapper.text()).toContain("You reached your plan's usage limit - Upgrade Now")
  })

  it('renders lockout reasons', () => {
    const wrapper = shallowMount(BillingBox, { localVue, mocks, store })
    expect(wrapper.findAll('li')).toHaveLength(4)
  })
})

describe('active sub, out of credits, but not locked out yet', () => {
  beforeEach(() => {
    billingInfo.customer.stripe_subscription_status = StripeSubscriptionStatus.Active
    billingInfo.customer_subscription!.annotation_credits_bonus = 20
    billingInfo.customer_subscription!.annotation_credits_used = 130
    billingInfo.customer_subscription!.annotation_credits_standard = 100
    store.commit('billing/SET_BILLING_INFO', billingInfo)
  })

  itMatchesSnapshot()
  itRendersNothing()
})

describe('when the user canot see customer data', () => {
  beforeEach(() => {
    mocks.$can = () => false
  })

  itMatchesSnapshot()
  itRendersNothing()
})
