import { createLocalVue, shallowMount } from '@vue/test-utils'

import YellowPill from '@/components/Common/Pill/YellowPill.vue'

const localVue = createLocalVue()

const slots = {
  default: 'A message'
}

it('matches snapshot', () => {
  const wrapper = shallowMount(YellowPill, { localVue, slots })
  expect(wrapper).toMatchSnapshot()
})

it('renders slot', () => {
  const wrapper = shallowMount(YellowPill, { localVue, slots })
  expect(wrapper.text()).toContain(slots.default)
})
