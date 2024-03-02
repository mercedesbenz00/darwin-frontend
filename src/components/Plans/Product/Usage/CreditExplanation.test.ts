import { createLocalVue, shallowMount } from '@vue/test-utils'

import CreditExplanation from '@/components/Plans/Product/Usage/CreditExplanation.vue'

const localVue = createLocalVue()

it('matches snapshot', () => {
  const wrapper = shallowMount(CreditExplanation, { localVue })
  expect(wrapper).toMatchSnapshot()
})
