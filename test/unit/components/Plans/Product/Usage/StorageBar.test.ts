import { createLocalVue, shallowMount } from '@vue/test-utils'

import { buildBillingInfoPayload, buildCustomerSubscriptionPayload } from 'test/unit/factories'

import StorageBar from '@/components/Plans/Product/Usage/StorageBar.vue'
import { BillingInfoPayload } from '@/store/modules/billing/types'

const localVue = createLocalVue()

let propsData: {
  billingInfo: BillingInfoPayload
}

beforeEach(() => {
  const subscription = buildCustomerSubscriptionPayload({
    storage_used: 100,
    storage_standard_max_in_period: 5000
  })

  propsData = {
    billingInfo: buildBillingInfoPayload({ customer_subscription: subscription })
  }
})

const itMatchesSnapshot = () => it('matches snapshot', () => {
  const wrapper = shallowMount(StorageBar, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

itMatchesSnapshot()

it('nicely formats values', () => {
  const wrapper = shallowMount(StorageBar, { localVue, propsData })
  expect(wrapper.text()).toContain('100')
  expect(wrapper.text()).toContain('5,000')
})

it('includes extra storage with total', () => {
  propsData.billingInfo.customer_subscription.storage_extra = 20
  const wrapper = shallowMount(StorageBar, { localVue, propsData })
  expect(wrapper.text()).toContain('100')
  expect(wrapper.text()).toContain('5,020')
})

it('sets width of progress bar', () => {
  const wrapper = shallowMount(StorageBar, { localVue, propsData })
  expect(wrapper.find<HTMLDivElement>('.storage-bar__bar').element.style.width).toEqual('2%')
})

describe('when storage low', () => {
  beforeEach(() => {
    propsData.billingInfo.customer_subscription.storage_used = 4000
  })

  itMatchesSnapshot()

  it('adds special class to the bar', () => {
    const wrapper = shallowMount(StorageBar, { localVue, propsData })
    expect(wrapper.find('.storage-bar__bar--low').exists()).toBe(true)
  })
})

describe('when storage fully used up', () => {
  beforeEach(() => {
    propsData.billingInfo.customer_subscription.storage_used = 5000
  })

  itMatchesSnapshot()

  it('adds special class to the bar', () => {
    const wrapper = shallowMount(StorageBar, { localVue, propsData })
    expect(wrapper.find('.storage-bar__bar--critical').exists()).toBe(true)
  })
})
