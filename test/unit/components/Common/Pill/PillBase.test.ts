import { createLocalVue, shallowMount } from '@vue/test-utils'

import PillBase from '@/components/Common/Pill/PillBase.vue'

const localVue = createLocalVue()

const slots = {
  default: 'A message'
}

it('matches snapshot', () => {
  const wrapper = shallowMount(PillBase, { localVue, slots })
  expect(wrapper).toMatchSnapshot()
})

it('renders slot', () => {
  const wrapper = shallowMount(PillBase, { localVue, slots })
  expect(wrapper.text()).toContain(slots.default)
})
