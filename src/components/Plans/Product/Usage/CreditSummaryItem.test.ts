import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildBillingInfoPayload,
  buildCreditUsagePayload,
  buildCustomerPayload,
  buildCustomerSubscriptionPayload,
  buildTeamPayload
} from 'test/unit/factories'

import CreditSummaryItem from '@/components/Plans/Product/Usage/CreditSummaryItem.vue'
import SummaryItemLayout from '@/components/Plans/Product/Usage/SummaryItemLayout.vue'
import { BillingInfoPayload, ProductType } from '@/store/modules/billing/types'
import { CreditUsagePayload, TeamPayload } from '@/store/types'

const v7 = buildTeamPayload({ id: 7, name: 'V7' })

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

const stubs = {
  'summary-item-layout': SummaryItemLayout
}

beforeEach(() => {
  store = createTestStore()
})

class LimiterModel {
  wrapper: Wrapper<Vue>

  constructor (wrapper: Wrapper<Vue>) {
    this.wrapper = wrapper
  }

  get isDisabled (): boolean {
    return this.wrapper.props('disabled') === true
  }

  triggerSet (value: number): Vue {
    return this.wrapper.vm.$emit('set-limit', value)
  }

  triggerReset (): Vue {
    return this.wrapper.vm.$emit('reset-limit')
  }
}

class Model {
  wrapper: Wrapper<Vue>

  constructor (wrapper: Wrapper<Vue>) {
    this.wrapper = wrapper
  }

  get bar (): { wrapper: Wrapper<Vue> } {
    const bar = this.wrapper.find('credit-bar-stub')
    return {
      wrapper: bar
    }
  }

  get limiter (): LimiterModel {
    const limiter = this.wrapper.find('usage-limiter-stub')
    return new LimiterModel(limiter)
  }

  get name (): { wrapper: Wrapper<Vue> } {
    const name = this.wrapper.find('header-4-stub')
    return {
      wrapper: name
    }
  }
}

let propsData: {
  billingInfo: BillingInfoPayload
  creditUsage: CreditUsagePayload
  partnerBillingInfo?: BillingInfoPayload
  team: TeamPayload
}

const itMatchesSnapshot = (): void => it('matches snapshot', () => {
  const wrapper = shallowMount(CreditSummaryItem, { localVue, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

const itRendersBar = (): void => it('renders bar', () => {
  const wrapper = shallowMount(CreditSummaryItem, { localVue, propsData, store, stubs })
  const model = new Model(wrapper)
  expect(model.bar.wrapper.exists()).toBe(true)
})

const itRendersName = (): void => it('renders name', () => {
  const wrapper = shallowMount(CreditSummaryItem, { localVue, propsData, store, stubs })
  const model = new Model(wrapper)
  expect(model.name.wrapper.exists()).toBe(true)
  expect(model.name.wrapper.text()).toEqual(propsData.team.name)
})

const itDoesNotRenderName = (): void => it('does not render name', () => {
  const wrapper = shallowMount(CreditSummaryItem, { localVue, propsData, store, stubs })
  const model = new Model(wrapper)
  expect(model.name.wrapper.exists()).toBe(false)
})

const itRendersLimiter = (): void => it('renders limiter', () => {
  const wrapper = shallowMount(CreditSummaryItem, { localVue, propsData, store, stubs })
  const model = new Model(wrapper)
  expect(model.limiter.wrapper.exists()).toBe(true)
})

const itDoesNotRenderLimiter = (): void => it('does not render limiter', () => {
  const wrapper = shallowMount(CreditSummaryItem, { localVue, propsData, store, stubs })
  const model = new Model(wrapper)
  expect(model.limiter.wrapper.exists()).toBe(false)
})

describe('when team is regular', () => {
  beforeEach(() => {
    propsData = {
      team: v7,
      billingInfo: buildBillingInfoPayload({}),
      creditUsage: buildCreditUsagePayload({})
    }
  })

  itMatchesSnapshot()
  itDoesNotRenderName()
  itRendersBar()
  itDoesNotRenderLimiter()
})

describe('when team is partner with clients', () => {
  let partner: TeamPayload

  beforeEach(() => {
    partner = buildTeamPayload({
      id: 1,
      name: 'A partner',
      managed_status: 'partner',
      clients: [
        buildTeamPayload({ id: 11, name: 'Client 1' }),
        buildTeamPayload({ id: 12, name: 'Client 2' })
      ]
    })

    const partnerInfo = buildBillingInfoPayload({
      clients: [
        buildBillingInfoPayload({ customer: buildCustomerPayload({ team_id: 11 }) }),
        buildBillingInfoPayload({ customer: buildCustomerPayload({ team_id: 12 }) })
      ]
    })

    const partnerUsage = buildCreditUsagePayload({
      team_id: 1,
      clients: [
        buildCreditUsagePayload({ team_id: 11 }),
        buildCreditUsagePayload({ team_id: 12 })
      ]
    })

    propsData = {
      team: partner,
      billingInfo: partnerInfo,
      creditUsage: partnerUsage
    }
  })

  itMatchesSnapshot()
  itRendersBar()
  itRendersName()
  itDoesNotRenderLimiter()
})

describe('when team is client on own page', () => {
  beforeEach(() => {
    propsData = {
      team: buildTeamPayload({ id: 1, name: 'Client' }),
      billingInfo: buildBillingInfoPayload({ }),
      creditUsage: buildCreditUsagePayload({ team_id: 1 })
    }
  })

  itMatchesSnapshot()
  itDoesNotRenderName()
  itRendersBar()
  itDoesNotRenderLimiter()
})

describe('when team is client on partner page, who is being limited', () => {
  beforeEach(() => {
    propsData = {
      team: buildTeamPayload({ id: 1, name: 'Client', managed_status: 'client' }),
      billingInfo: buildBillingInfoPayload({
        customer_subscription: buildCustomerSubscriptionPayload({
          annotation_credits_standard_max_in_period: 100
        })
      }),
      creditUsage: buildCreditUsagePayload({ team_id: 1 }),
      partnerBillingInfo: buildBillingInfoPayload({
        customer_subscription: buildCustomerSubscriptionPayload({
          annotation_credits_standard_max_in_period: 150
        })
      })
    }
  })

  itMatchesSnapshot()
  itRendersName()
  itRendersBar()
  itRendersLimiter()

  it('allows resetting usage for client', async () => {
    const wrapper = shallowMount(CreditSummaryItem, { localVue, propsData, store, stubs })
    const model = new Model(wrapper)

    await model.limiter.triggerReset()
    expect(store.dispatch).toHaveBeenCalledWith('billing/resetClientUsageLimit', {
      client: propsData.team,
      type: ProductType.AnnotationCredits
    })
  })

  it('dispatches toast on reset success', async () => {
    const wrapper = shallowMount(CreditSummaryItem, { localVue, propsData, store, stubs })
    const model = new Model(wrapper)
    await model.limiter.triggerReset()
    await wrapper.vm.$nextTick()
    expect(store.dispatch).toHaveBeenCalledWith('toast/notify', { content: expect.any(String) })
  })

  it('disables limiter while usage is being reset', async () => {
    const wrapper = shallowMount(CreditSummaryItem, { localVue, propsData, store, stubs })
    const model = new Model(wrapper)

    expect(model.limiter.isDisabled).toBe(false)
    await model.limiter.triggerReset()
    expect(model.limiter.isDisabled).toBe(true)
    await flushPromises()
    expect(model.limiter.isDisabled).toBe(false)
  })

  it('dispatches error if usage reset fails', async () => {
    (store.dispatch as jest.Mock).mockResolvedValue({ error: { message: 'Fake error' } })
    const wrapper = shallowMount(CreditSummaryItem, { localVue, propsData, store, stubs })
    const model = new Model(wrapper)

    await model.limiter.triggerReset()
    await flushPromises()
    expect(store.dispatch).toHaveBeenCalledWith('toast/warning', { content: 'Fake error' })
  })

  it('allows setting usage for client', async () => {
    const wrapper = shallowMount(CreditSummaryItem, { localVue, propsData, store, stubs })
    const model = new Model(wrapper)

    await model.limiter.triggerSet(150)
    expect(store.dispatch).toHaveBeenCalledWith('billing/setClientUsageLimit', {
      client: propsData.team,
      type: ProductType.AnnotationCredits,
      value: 150
    })

    await model.limiter.triggerSet(250)
    expect(store.dispatch).toHaveBeenCalledWith('billing/setClientUsageLimit', {
      client: propsData.team,
      type: ProductType.AnnotationCredits,
      value: 250
    })
  })

  it('disables limiter while usage is being set', async () => {
    const wrapper = shallowMount(CreditSummaryItem, { localVue, propsData, store, stubs })
    const model = new Model(wrapper)

    expect(model.limiter.isDisabled).toBe(false)
    await model.limiter.triggerSet(50)
    expect(model.limiter.isDisabled).toBe(true)
    await flushPromises()
    expect(model.limiter.isDisabled).toBe(false)
  })

  it('dispatches toast on usage set success', async () => {
    const wrapper = shallowMount(CreditSummaryItem, { localVue, propsData, store, stubs })
    const model = new Model(wrapper)
    await model.limiter.triggerSet(40)
    await wrapper.vm.$nextTick()
    expect(store.dispatch).toHaveBeenCalledWith('toast/notify', { content: expect.any(String) })
  })

  it('dispatches error if usage set fails', async () => {
    (store.dispatch as jest.Mock).mockResolvedValue({ error: { message: 'Fake error' } })
    const wrapper = shallowMount(CreditSummaryItem, { localVue, propsData, store, stubs })
    const model = new Model(wrapper)

    await model.limiter.triggerSet(20)
    await flushPromises()
    expect(store.dispatch).toHaveBeenCalledWith('toast/warning', { content: 'Fake error' })
  })
})
