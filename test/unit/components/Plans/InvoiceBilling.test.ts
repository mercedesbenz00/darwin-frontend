import { createLocalVue, shallowMount } from '@vue/test-utils'

import InvoiceBilling from '@/components/Plans/InvoiceBilling.vue'

const localVue = createLocalVue()

it('matches snapshot', () => {
  const wrapper = shallowMount(InvoiceBilling, { localVue })
  expect(wrapper.element).toMatchSnapshot()
})
