import { createLocalVue, shallowMount, Slots } from '@vue/test-utils'

import Header4 from '@/components/Common/Header4.vue'

const localVue = createLocalVue()
let slots: Slots

beforeEach(() => {
  slots = {}
})

it('matches snapshot', () => {
  const wrapper = shallowMount(Header4, { localVue, slots })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with slots', () => {
  slots.default = 'default-slot'
  const wrapper = shallowMount(Header4, { localVue, slots })
  expect(wrapper).toMatchSnapshot()
})
