import { createLocalVue, shallowMount } from '@vue/test-utils'

import PurplePill from '@/components/Common/Pill/PurplePill.vue'

const localVue = createLocalVue()

const slots = {
  default: 'A message'
}

it('matches snapshot', () => {
  const wrapper = shallowMount(PurplePill, { localVue, slots })
  expect(wrapper).toMatchSnapshot()
})

it('renders slot', () => {
  const wrapper = shallowMount(PurplePill, { localVue, slots })
  expect(wrapper.text()).toContain(slots.default)
})
