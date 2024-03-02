import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'

import PrimaryButton from '@/components/Common/Button/V1/PrimaryButton.vue'

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
  const wrapper = shallowMount(PrimaryButton, { localVue, slots, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('renders slot', () => {
  const wrapper = shallowMount(PrimaryButton, { localVue, slots, stubs })
  expect(wrapper.text()).toContain(slots.default)
})
