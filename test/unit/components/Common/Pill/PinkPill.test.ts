import { createLocalVue, shallowMount } from '@vue/test-utils'

import PinkPill from '@/components/Common/Pill/PinkPill.vue'

const localVue = createLocalVue()

const slots = {
  default: 'A message'
}

it('matches snapshot', () => {
  const wrapper = shallowMount(PinkPill, { localVue, slots })
  expect(wrapper).toMatchSnapshot()
})

it('renders slot', () => {
  const wrapper = shallowMount(PinkPill, { localVue, slots })
  expect(wrapper.text()).toContain(slots.default)
})
