import { createLocalVue, mount } from '@vue/test-utils'

import { buildBillingInfoPayload, buildCustomerSubscriptionPayload } from 'test/unit/factories'

import StorageRemainingAmount from '@/components/Plans/Product/Usage/StorageRemainingAmount.vue'
import { BillingInfoPayload } from '@/store/modules/billing/types'

const localVue = createLocalVue()

let propsData: {
  info: BillingInfoPayload
}

beforeEach(() => {
  propsData = {
    info: buildBillingInfoPayload({
      customer_subscription: buildCustomerSubscriptionPayload({
        storage_standard_max_in_period: 50,
        storage_extra: 20,
        storage_used: 10
      })
    })
  }
})

it('matches snapshot', () => {
  const wrapper = mount(StorageRemainingAmount, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('shows remaining credits correctly', () => {
  const wrapper = mount(StorageRemainingAmount, { localVue, propsData })
  expect(wrapper.text()).toContain('Remaining:')
  expect(wrapper.text()).toContain('60')
})
