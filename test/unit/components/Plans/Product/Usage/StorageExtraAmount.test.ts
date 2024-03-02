import { createLocalVue, mount } from '@vue/test-utils'

import { buildBillingInfoPayload, buildCustomerSubscriptionPayload } from 'test/unit/factories'

import StorageExtraAmount from '@/components/Plans/Product/Usage/StorageExtraAmount.vue'
import { BillingInfoPayload } from '@/store/modules/billing/types'

const localVue = createLocalVue()

let propsData: {
  info: BillingInfoPayload
}

beforeEach(() => {
  propsData = {
    info: buildBillingInfoPayload({
      customer_subscription: buildCustomerSubscriptionPayload({ storage_extra: 20 })
    })
  }
})

it('matches snapshot', () => {
  const wrapper = mount(StorageExtraAmount, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('shows remaining credits correctly', () => {
  const wrapper = mount(StorageExtraAmount, { localVue, propsData })
  expect(wrapper.text()).toContain('Extra:')
  expect(wrapper.text()).toContain('20')
})
