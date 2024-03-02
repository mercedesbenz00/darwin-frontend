import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'

import PositiveButton from '@/components/Common/Button/V1/PositiveButton.vue'

const localVue = createLocalVue()
const stubs: Stubs = {
  ButtonTemplate: {
    template: '<button><slot></slot></button>'
  }
}
const slots = {
  default: 'A message'
}

it('matches snapshot', () => {
  const wrapper = shallowMount(PositiveButton, { localVue, slots, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('renders slot', () => {
  const wrapper = shallowMount(PositiveButton, { localVue, slots, stubs })
  expect(wrapper.text()).toContain(slots.default)
})
