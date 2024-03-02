import { createLocalVue, shallowMount } from '@vue/test-utils'

import ErrorTip from '@/components/Common/ErrorTip/ErrorTip.vue'

const localVue = createLocalVue()

it('matches snapshot without slot', () => {
  const wrapper = shallowMount(ErrorTip, { localVue })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with slot', () => {
  const slots = { default: 'Default slot' }
  const wrapper = shallowMount(ErrorTip, { localVue, slots })
  expect(wrapper).toMatchSnapshot()
})
