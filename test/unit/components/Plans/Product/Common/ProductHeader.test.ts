import { createLocalVue, shallowMount } from '@vue/test-utils'

import { buildBillingInfoPayload } from 'test/unit/factories'

import ProductHeader from '@/components/Plans/Product/Common/ProductHeader.vue'
import { BillingInfoPayload } from '@/store/modules/billing/types'
import { dateFromUtcISO } from '@/utils'

const localVue = createLocalVue()

let propsData: {
  billingInfo: BillingInfoPayload
}

beforeEach(() => {
  propsData = {
    billingInfo: buildBillingInfoPayload({ })
  }

  propsData.billingInfo.customer_subscription!.annotation_credits_standard = 300
  const renewDate = Math.floor(dateFromUtcISO('2030-05-05T00:00:00').getTime() / 1000)
  propsData.billingInfo.customer.stripe_subscription_period_end = renewDate
})

it('matches snapshot', () => {
  const wrapper = shallowMount(ProductHeader, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('renders plan name', async () => {
  const wrapper = shallowMount(ProductHeader, { localVue, propsData })
  expect(wrapper.text()).toContain('team')

  const billingInfo = {
    ...propsData.billingInfo,
    customer_subscription: {
      ...propsData.billingInfo.customer_subscription,
      annotation_credits_standard: 1000
    }
  }

  await wrapper.setProps({ billingInfo })
  expect(wrapper.html()).toContain('business')
})

it('matches snapshot when given renew date', () => {
  const wrapper = shallowMount(ProductHeader, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('renders renew date', () => {
  const wrapper = shallowMount(ProductHeader, { localVue, propsData })
  expect(wrapper.text()).toContain('Renews 05/05/30')
})
