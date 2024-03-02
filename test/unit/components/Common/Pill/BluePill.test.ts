import { createLocalVue, shallowMount } from '@vue/test-utils'

import BluePill from '@/components/Common/Pill/BluePill.vue'

const localVue = createLocalVue()

const slots = {
  default: 'A message'
}

it('matches snapshot', () => {
  const wrapper = shallowMount(BluePill, { localVue, slots })
  expect(wrapper).toMatchSnapshot()
})

it('renders slot', () => {
  const wrapper = shallowMount(BluePill, { localVue, slots })
  expect(wrapper.text()).toContain(slots.default)
})
