import { createLocalVue, shallowMount } from '@vue/test-utils'

import FeatherLightPill from '@/components/Common/Pill/FeatherLightPill.vue'

const localVue = createLocalVue()

const slots = {
  default: 'A message'
}

it('matches snapshot', () => {
  const wrapper = shallowMount(FeatherLightPill, { localVue, slots })
  expect(wrapper).toMatchSnapshot()
})

it('renders slot', () => {
  const wrapper = shallowMount(FeatherLightPill, { localVue, slots })
  expect(wrapper.text()).toContain(slots.default)
})
