import { createLocalVue, shallowMount } from '@vue/test-utils'

import AliceBluePanel from '@/components/Common/Panel/AliceBluePanel.vue'

const localVue = createLocalVue()

const slots = {
  default: 'A message'
}

it('matches snapshot', () => {
  const wrapper = shallowMount(AliceBluePanel, { localVue, slots })
  expect(wrapper).toMatchSnapshot()
})

it('renders slot', () => {
  const wrapper = shallowMount(AliceBluePanel, { localVue, slots })
  expect(wrapper.text()).toContain(slots.default)
})
