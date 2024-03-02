import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import VueJSModal from 'vue-js-modal'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildBillingInfoPayload,
  buildCustomerPayload,
  buildCustomerSubscriptionPayload
} from 'test/unit/factories'
import { EditProductLayout } from 'test/unit/stubs'

import EditPlanModal from '@/components/Plans/Product/AnnotationCredits/EditPlanModal.vue'
import { PlanPricing } from '@/components/Plans/Product/utils'
import { ProductType } from '@/store/modules/billing/types'
import { dateFromUtcISO } from '@/utils'

let localVue: ReturnType<typeof createLocalVue>
let store: ReturnType<typeof createTestStore>
let propsData: {
  busy: boolean
  initialPlan?: keyof typeof PlanPricing
}
let info: ReturnType<typeof buildBillingInfoPayload>

const periodEnd = Math.floor(
  dateFromUtcISO('2030-05-05T00:00:00').getTime() / 1000
)

// month earlier
const periodStart = periodEnd - (30 * 24 * 3600)

let mocks: {
  $route: { query: { upgrade?: keyof typeof PlanPricing } },
  $intercom: {
    trackEvent: jest.Mock,
    showNewMessage: jest.Mock
  }
}

beforeEach(() => {
  mocks = {
    $route: { query: { } },
    $intercom: {
      trackEvent: jest.fn(),
      showNewMessage: jest.fn()
    }
  }

  localVue = createLocalVue()
  localVue.use(Vuex)
  localVue.use(VueJSModal)

  info = buildBillingInfoPayload({
    customer: buildCustomerPayload({
      stripe_subscription_period_end: periodEnd,
      stripe_subscription_period_start: periodStart
    }),
    customer_subscription: buildCustomerSubscriptionPayload({
      annotation_credits_bonus: 10,
      annotation_credits_standard: 100,
      annotation_credits_standard_max_in_period: 100,
      annotation_credits_standard_max_in_period_at: periodStart,
      annotation_credits_used: 111
    })
  })
  propsData = { busy: false }

  store = createTestStore()
  store.commit('billing/SET_BILLING_INFO', info)
})

const stubs = { EditProductLayout }

const itMatchesSnapshot = (): void => {
  it('matches snaphsot', async () => {
    const wrapper = shallowMount(EditPlanModal, { localVue, mocks, propsData, store, stubs })
    await wrapper.vm.$nextTick()
    expect(wrapper).toMatchSnapshot()
  })
}

describe('with zero credit', () => {
  beforeEach(() => {
    info.customer_subscription!.annotation_credits_standard = 0
    info.customer_subscription!.annotation_credits_standard_max_in_period = 0
    store.commit('billing/SET_BILLING_INFO', info)
  })

  itMatchesSnapshot()
})

describe('with freemium credit', () => {
  beforeEach(() => {
    info.customer_subscription!.annotation_credits_standard = 100
    info.freemium = true
    store.commit('billing/SET_BILLING_INFO', info)
  })

  itMatchesSnapshot()

  describe('with initial plan as enterprise', () => {
    beforeEach(() => {
      propsData.initialPlan = 'enterprise'
    })

    itMatchesSnapshot()
  })
})

describe('with team credit', () => {
  beforeEach(() => {
    info.customer_subscription!.annotation_credits_standard = 300
    info.customer_subscription!.annotation_credits_standard_max_in_period = 300

    store.commit('billing/SET_BILLING_INFO', info)
  })

  itMatchesSnapshot()
})

describe('with business credit', () => {
  beforeEach(() => {
    info.customer_subscription!.annotation_credits_standard = 700
    info.customer_subscription!.annotation_credits_standard_max_in_period = 700

    store.commit('billing/SET_BILLING_INFO', info)
  })

  itMatchesSnapshot()
})

describe('with enterprise credit', () => {
  beforeEach(() => {
    info.customer_subscription!.annotation_credits_standard = 3500
    info.customer_subscription!.annotation_credits_standard_max_in_period = 3500

    store.commit('billing/SET_BILLING_INFO', info)
  })

  itMatchesSnapshot()
})

it('closes modal on edit cancel', () => {
  const wrapper = shallowMount(EditPlanModal, { localVue, mocks, propsData, store })

  const spy = jest.spyOn(wrapper.vm.$modal, 'hide')
  expect(spy).not.toHaveBeenCalled()

  wrapper.find('edit-product-layout-stub').vm.$emit('cancel')
  expect(spy).toHaveBeenCalledWith(ProductType.AnnotationCredits)
})

it('opens typeform modal when new amount is zero', async () => {
  const wrapper = shallowMount(EditPlanModal, { localVue, mocks, propsData, store, stubs })

  const modalShow = jest.spyOn(wrapper.vm.$modal, 'show')

  wrapper.setData({ newAmount: 0 })
  await wrapper.find('.edit-product-layout-stub').vm.$emit('confirm')
  expect(modalShow).toHaveBeenCalledWith('typeform-modal')
})

it('opens switch opendataset modal when plan is freemium', async () => {
  const wrapper = shallowMount(EditPlanModal, { localVue, mocks, propsData, store, stubs })

  const modalShow = jest.spyOn(wrapper.vm.$modal, 'show')

  wrapper.setData({ newAmount: 100 })
  await wrapper.find('.edit-product-layout-stub').vm.$emit('confirm')
  expect(modalShow).toHaveBeenCalledWith('switch-open-dataset-modal')
})

it('sets newAmount on mount and change', async () => {
  const wrapper = shallowMount(EditPlanModal, { localVue, mocks, propsData, store, stubs })
  expect(wrapper.vm.$data.newAmount).toEqual(100)
  await wrapper.find('new-amount-stub').vm.$emit('change', 500)
  expect(wrapper.vm.$data.newAmount).toEqual(700)
})

describe('Plans pricing steps applied properly', () => {
  it('sets newAmount to 0 if going down from 100', async () => {
    const wrapper = shallowMount(EditPlanModal, { localVue, mocks, propsData, store, stubs })
    expect(wrapper.vm.$data.newAmount).toEqual(100)
    await wrapper.find('new-amount-stub').vm.$emit('change', 80)
    expect(wrapper.vm.$data.newAmount).toEqual(0)
  })

  it('sets newAmount to 300 if going up from 0', async () => {
    const wrapper = shallowMount(EditPlanModal, { localVue, mocks, propsData, store, stubs })
    expect(wrapper.vm.$data.newAmount).toEqual(100)
    await wrapper.find('new-amount-stub').vm.$emit('change', 0)
    expect(wrapper.vm.$data.newAmount).toEqual(0)
    await wrapper.find('new-amount-stub').vm.$emit('change', 20)
    expect(wrapper.vm.$data.newAmount).toEqual(300)
  })
})

describe('Plans downgrade/upgrade button work properly', () => {
  it('upgrade', async () => {
    info.customer_subscription!.annotation_credits_standard = 0
    store.commit('billing/SET_BILLING_INFO', info)
    const wrapper = shallowMount(EditPlanModal, { localVue, mocks, propsData, store, stubs })
    await flushPromises()
    expect(wrapper.vm.$data.newAmount).toEqual(0)
    await wrapper.find('button.edit-plan__upgrade').trigger('click')
    expect(wrapper.vm.$data.newAmount).toEqual(300)
    expect(wrapper.find('.edit-plan__cost').text()).toBe('Talk to Sales')
    await wrapper.find('button.edit-plan__upgrade').trigger('click')
    expect(wrapper.vm.$data.newAmount).toEqual(700)
    expect(wrapper.find('.edit-plan__cost').text()).toBe('Talk to Sales')
    await wrapper.find('button.edit-plan__upgrade').trigger('click')
    expect(wrapper.vm.$data.newAmount).toEqual(3500)
    expect(wrapper.find('button.edit-plan__upgrade').attributes('disabled')).toBe('disabled')
  })

  it('downgrade', async () => {
    info.customer_subscription!.annotation_credits_standard = 3500
    store.commit('billing/SET_BILLING_INFO', info)
    const wrapper = shallowMount(EditPlanModal, { localVue, mocks, propsData, store, stubs })
    await flushPromises()
    expect(wrapper.vm.$data.newAmount).toEqual(3500)
    expect(wrapper.find('button.edit-plan__upgrade').attributes('disabled')).toBe('disabled')
    await wrapper.find('button.edit-plan__downgrade').trigger('click')
    expect(wrapper.vm.$data.newAmount).toEqual(700)
    await wrapper.find('button.edit-plan__downgrade').trigger('click')
    expect(wrapper.vm.$data.newAmount).toEqual(300)
    await wrapper.find('button.edit-plan__downgrade').trigger('click')
    expect(wrapper.vm.$data.newAmount).toEqual(0)
    expect(wrapper.find('button.edit-plan__downgrade').attributes('disabled')).toBe('disabled')
  })
})

it('adds quantity discount to features list if new amount is high enough while subscribed to Business or Enterprise', async () => {
  info.customer_subscription!.annotation_credits_standard = 700
  store.commit('billing/SET_BILLING_INFO', info)
  const wrapper = shallowMount(EditPlanModal, { localVue, mocks, propsData, store, stubs })
  await flushPromises()

  expect(wrapper.find('.edit-plan__discount').text())
    .toContain('Quantity discount: $1.40/unit ($20.10 saved)')

  await wrapper.find('new-amount-stub').vm.$emit('change', 1000)
  expect(wrapper.find('.edit-plan__discount').text())
    .toContain('Quantity discount: $1.30/unit ($50.20 saved)')
})

it('hides quantity discount while subscribed to lower than Business', async () => {
  info.customer_subscription!.annotation_credits_standard = 100
  store.commit('billing/SET_BILLING_INFO', info)
  const wrapper = shallowMount(EditPlanModal, { localVue, mocks, propsData, store, stubs })
  await flushPromises()

  await wrapper.find('new-amount-stub').vm.$emit('change', 1000)
  expect(wrapper.find('.edit-plan__discount').exists()).toBeFalsy()
})

it('shows $0 to be minimum in features list', async () => {
  const wrapper = shallowMount(EditPlanModal, { localVue, mocks, propsData, store, stubs })

  await wrapper.find('new-amount-stub').vm.$emit('change', 20)
  expect(wrapper.find('.edit-plan__cost-container').text())
    .toContain('$0.00 per month')
})

it('computes automation action feature from subscription field and new amount for freemium plan', async () => {
  info.freemium = true
  store.commit('billing/SET_BILLING_INFO', info)
  const wrapper = shallowMount(EditPlanModal, { localVue, mocks, propsData, store, stubs })

  await wrapper.find('new-amount-stub').vm.$emit('change', 100)
  expect(wrapper.find('feature-list-stub').props('features'))
    .toContainEqual({ label: 'Up to 120,000 automation actions per year', enabled: true })

  await wrapper.find('new-amount-stub').vm.$emit('change', 150)
  expect(wrapper.find('feature-list-stub').props('features'))
    .toContainEqual({ label: 'Up to 360,000 automation actions per year', enabled: true })

  info.customer_subscription!.seconds_per_automation_action = 72
  await store.commit('billing/SET_BILLING_INFO', info)
  expect(wrapper.find('feature-list-stub').props('features'))
    .toContainEqual({ label: 'Up to 180,000 automation actions per year', enabled: true })
})

it('renders issues if newAmount < used', async () => {
  const wrapper = shallowMount(EditPlanModal, { localVue, mocks, propsData, store, stubs })
  await wrapper.find('new-amount-stub').vm.$emit('change', 0)
  expect(wrapper.text()).toContain('Warning')
})

describe('on dirty/clean', () => {
  it('prevents action dispatch while dirty', async () => {
    jest.useFakeTimers()
    const stubs = { EditProductLayout }
    const wrapper = shallowMount(EditPlanModal, { localVue, mocks, propsData, store, stubs })

    await wrapper.find('new-amount-stub').vm.$emit('dirty')
    await wrapper.setData({ busy: true })
    expect(wrapper.findComponent(EditProductLayout).props('disabled')).toBe(true)

    await wrapper.find('new-amount-stub').vm.$emit('clean')
    expect(wrapper.findComponent(EditProductLayout).props('disabled')).toBe(true)

    jest.runAllTimers()
    await flushPromises()

    await wrapper.setData({ busy: false })
    expect(wrapper.findComponent(EditProductLayout).props('disabled')).toBe(false)
  })
})

it('sets new amount from route query', async () => {
  mocks.$route.query.upgrade = 'enterprise'
  const wrapper = shallowMount(EditPlanModal, { localVue, mocks, propsData, store, stubs })
  await wrapper.vm.$nextTick()

  expect(wrapper.find('edit-plan-teaser-stub').props('plan')).toEqual('enterprise')
})

describe('on "confirm"', () => {
  it('dispatches action', async () => {
    const wrapper = shallowMount(EditPlanModal, { localVue, mocks, propsData, store, stubs })
    wrapper.setData({ newAmount: 50 })

    await wrapper.find('.edit-product-layout-stub').vm.$emit('confirm')
    expect(store.dispatch).toHaveBeenCalledWith('billing/setSubscriptionAmount', {
      type: ProductType.AnnotationCredits, value: 50
    })
  })

  it('does not close modal on failure', async () => {
    const wrapper = shallowMount(EditPlanModal, { localVue, mocks, propsData, store, stubs })

    const spy = jest.spyOn(wrapper.vm.$modal, 'hide')
    expect(spy).not.toHaveBeenCalled()

    jest.spyOn(store, 'dispatch').mockResolvedValue({ error: { message: 'Fake error' } })
    wrapper.setData({ newAmount: 50 })
    await wrapper.find('.edit-product-layout-stub').vm.$emit('confirm')

    await flushPromises()
    expect(spy).not.toHaveBeenCalledWith(ProductType.AnnotationCredits)
  })

  it('dispatches toast on failure', async () => {
    const wrapper = shallowMount(EditPlanModal, { localVue, mocks, propsData, store, stubs })
    jest.spyOn(store, 'dispatch').mockResolvedValue({ error: { message: 'Fake error' } })
    wrapper.setData({ newAmount: 50 })
    await wrapper.find('.edit-product-layout-stub').vm.$emit('confirm')
    await flushPromises()

    expect(store.dispatch).toHaveBeenCalledWith('toast/warning', { content: 'Fake error' })
  })

  it('emits error on failure', async () => {
    const wrapper = shallowMount(EditPlanModal, { localVue, mocks, propsData, store, stubs })
    jest.spyOn(store, 'dispatch').mockResolvedValue({ error: { message: 'Fake error' } })
    wrapper.setData({ newAmount: 50 })
    await wrapper.find('.edit-product-layout-stub').vm.$emit('confirm')
    await flushPromises()

    expect(wrapper.emitted()['billing-error']).toHaveLength(1)
  })
})

describe('on "Contact Sales"', () => {
  it('triggers intercom contact for business', async () => {
    const wrapper = shallowMount(EditPlanModal, { localVue, mocks, propsData, store, stubs })
    wrapper.setData({ newAmount: 700 })
    await wrapper.find('.edit-product-layout-stub').vm.$emit('confirm')
    expect(mocks.$intercom.trackEvent).toBeCalledWith('upgrade_request', { plan: 'Business' })
    expect(mocks.$intercom.showNewMessage).toBeCalled()
  })

  it('triggers intercom contact for enterprise', async () => {
    const wrapper = shallowMount(EditPlanModal, { localVue, mocks, propsData, store, stubs })
    wrapper.setData({ newAmount: 3500 })
    await wrapper.find('.edit-product-layout-stub').vm.$emit('confirm')
    expect(mocks.$intercom.trackEvent).toBeCalledWith('upgrade_request', { plan: 'Enterprise' })
    expect(mocks.$intercom.showNewMessage).toBeCalled()
  })
})
