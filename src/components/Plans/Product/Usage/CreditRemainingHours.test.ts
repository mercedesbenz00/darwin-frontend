import { createLocalVue, mount } from '@vue/test-utils'

import CreditRemainingHours from '@/components/Plans/Product/Usage/CreditRemainingHours.vue'

const localVue = createLocalVue()

let propsData: {
  value: number
}

beforeEach(() => {
  propsData = {
    value: 50
  }
})

it('matches snapshot', () => {
  const wrapper = mount(CreditRemainingHours, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('shows remaining credits correctly', () => {
  const wrapper = mount(CreditRemainingHours, { localVue, propsData })
  expect(wrapper.text()).toContain('Remaining:')
  expect(wrapper.text()).toContain('50')
})
