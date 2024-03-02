import { createLocalVue, mount } from '@vue/test-utils'

import { buildBillingInfoPayload, buildCustomerSubscriptionPayload } from 'test/unit/factories'

import CreditBonusHours from '@/components/Plans/Product/Usage/CreditBonusHours.vue'
import { BillingInfoPayload } from '@/store/modules/billing/types'

const localVue = createLocalVue()

let propsData: {
  info: BillingInfoPayload
}

beforeEach(() => {
  propsData = {
    info: buildBillingInfoPayload({
      customer_subscription: buildCustomerSubscriptionPayload({ annotation_credits_bonus: 50 })
    })
  }
})

it('matches snapshot', () => {
  const wrapper = mount(CreditBonusHours, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('shows remaining credits correctly', () => {
  const wrapper = mount(CreditBonusHours, { localVue, propsData })
  expect(wrapper.text()).toContain('Bonus:')
  expect(wrapper.text()).toContain('50')
})
