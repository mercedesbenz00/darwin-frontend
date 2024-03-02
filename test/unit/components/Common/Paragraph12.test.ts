import { createLocalVue, shallowMount, Slots } from '@vue/test-utils'

import Paragraph12 from '@/components/Common/Paragraph12.vue'

const localVue = createLocalVue()
let slots: Slots

beforeEach(() => {
  slots = {}
})

it('matches snapshot', () => {
  const wrapper = shallowMount(Paragraph12, { localVue, slots })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with slots', () => {
  slots.default = 'default-slot'
  const wrapper = shallowMount(Paragraph12, { localVue, slots })
  expect(wrapper).toMatchSnapshot()
})
