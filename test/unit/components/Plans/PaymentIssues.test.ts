import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'

import PaymentIssues from '@/components/Plans/PaymentIssues.vue'
import { StripeSubscriptionStatus } from '@/store/modules/billing/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
})

it('matches snapshot', () => {
  const wrapper = shallowMount(PaymentIssues, { localVue, store })

  expect(wrapper.element).toMatchSnapshot()
})

describe('subscription status message', () => {
  const badStatuses: StripeSubscriptionStatus[] = [
    StripeSubscriptionStatus.Unpaid,
    StripeSubscriptionStatus.IncompleteExpired,
    StripeSubscriptionStatus.PastDue
  ]

  badStatuses.forEach(status => {
    it(`is rendered if customer subscription status is ${status}`, () => {
      store.commit('billing/SET_BILLING_INFO', { customer: { stripe_subscription_status: status } })
      const wrapper = shallowMount(PaymentIssues, { localVue, store })

      expect(wrapper.find('.issues').exists()).toBe(true)
    })
  })

  it('is not rendered if customer subscription status is not set', () => {
    store.commit('billing/SET_BILLING_INFO', {
      customer: { stripe_subscription_status: StripeSubscriptionStatus.Active }
    })

    const wrapper = shallowMount(PaymentIssues, { localVue, store })

    expect(wrapper.find('.issues').exists()).toBe(false)
  })

  it('is not rendered if customer subscription status is active', () => {
    const wrapper = shallowMount(PaymentIssues, { localVue, store })

    expect(wrapper.find('.issues').exists()).toBe(false)
  })
})
