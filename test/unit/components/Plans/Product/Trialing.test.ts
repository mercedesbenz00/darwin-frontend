import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildBillingInfoPayload } from 'test/unit/factories'

import Trialing from '@/components/Plans/Product/Trialing.vue'
import { StripeSubscriptionStatus } from '@/store/modules/billing/types'

const localVue = createLocalVue()
localVue.use(Vuex)
let store: ReturnType<typeof createTestStore>
let info: ReturnType<typeof buildBillingInfoPayload>

beforeEach(() => {
  store = createTestStore()
  info = buildBillingInfoPayload({})
})

describe('when not trialing', () => {
  beforeEach(() => {
    store.commit('billing/SET_BILLING_INFO', info)
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(Trialing, { localVue, store })
    expect(wrapper).toMatchSnapshot()
  })

  it('does not render', () => {
    const wrapper = shallowMount(Trialing, { localVue, store })
    expect(wrapper.html()).toEqual('')
  })
})

describe('when trialing', () => {
  beforeEach(() => {
    info.customer.stripe_subscription_status = StripeSubscriptionStatus.Trialing
    info.customer.stripe_subscription_period_end = Math.floor(Date.now() / 1000) + (3600 * 24 * 9)
    store.commit('billing/SET_BILLING_INFO', info)
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(Trialing, { localVue, store })
    expect(wrapper).toMatchSnapshot()
  })

  it('renders', () => {
    const wrapper = shallowMount(Trialing, { localVue, store })
    expect(wrapper.html()).toBeDefined()
  })

  it('renders remaining trial time in days', async () => {
    const wrapper = shallowMount(Trialing, { localVue, store })
    expect(wrapper.text()).toContain('9 days left')

    info.customer.stripe_subscription_period_end = Math.floor(Date.now() / 1000) + (3600 * 24 * 1)
    await store.commit('billing/SET_BILLING_INFO', info)
    expect(wrapper.text()).toContain('1 day left')
  })
})
