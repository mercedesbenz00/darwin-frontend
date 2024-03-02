import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'

import NegativeButton from '@/components/Common/Button/V1/NegativeButton.vue'

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
  const wrapper = shallowMount(NegativeButton, { localVue, slots, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('renders slot', () => {
  const wrapper = shallowMount(NegativeButton, { localVue, slots, stubs })
  expect(wrapper.text()).toContain(slots.default)
})
